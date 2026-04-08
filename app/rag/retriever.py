from qdrant_client.models import Filter, FieldCondition, MatchValue
from app.rag.qdrant_client import get_qdrant_client
from app.rag.embeddings import embed_text
from app.models.rag import RagResult
from app.config import settings

async def search_precedents(penalty_code: str, query_text: str, limit: int = 3) -> list[RagResult]:
    """Qdrant üzerinden KTK maddesine ve içerik benzerliğine göre emsal karar arar."""
    client = get_qdrant_client()
    
    # query'yi embed et
    query_vector = await embed_text(query_text)
    
    # sadece aynı ceza koduna sahip olan kararları filtrele
    q_filter = None
    if penalty_code:
        q_filter = Filter(
            must=[
                FieldCondition(
                    key="penalty_code",
                    match=MatchValue(value=penalty_code)
                )
            ]
        )
        
    try:
        search_result = await client.search(
            collection_name=settings.QDRANT_COLLECTION,
            query_vector=query_vector,
            query_filter=q_filter,
            limit=limit,
            score_threshold=0.5 # Çok alakasız olanlar gelmesin
        )
        
        results = []
        for scored_point in search_result:
            payload = scored_point.payload
            results.append(
                RagResult(
                    summary=payload.get("summary", ""),
                    full_text=payload.get("full_text", ""),
                    penalty_code=payload.get("penalty_code", ""),
                    similarity_score=scored_point.score
                )
            )
            
        return results
    except Exception as e:
        print(f"Qdrant arama hatası: {e}")
        return []
    finally:
        await client.close()
