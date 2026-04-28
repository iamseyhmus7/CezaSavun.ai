import json
from typing import List, Dict, Any
from app.config import settings
from app.rag.qdrant_client import get_qdrant_client
from app.agents import generate_json_from_gemini, load_prompt
from google import genai
from google.genai import types

# Gemini Client (Embedding için)
genai_client = genai.Client(api_key=settings.GOOGLE_API_KEY)

async def search_legal_context(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    """
    Qdrant üzerinde semantik arama yapar ve ilk aday listesini döner.
    """
    client = get_qdrant_client()
    collection_name = settings.QDRANT_COLLECTION
    
    try:
        # 1. Sorguyu vektörleştir
        response = genai_client.models.embed_content(
            model=settings.EMBEDDING_MODEL,
            contents=query,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        query_vector = response.embeddings[0].values
        
        # 2. Qdrant'ta ara
        search_result = await client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            limit=limit,
            with_payload=True
        )
        
        # 3. Sonuçları formatla
        candidates = []
        for res in search_result:
            candidates.append({
                "id": res.id,
                "score": res.score,
                "payload": res.payload
            })
            
        return candidates
    except Exception as e:
        print(f"❌ Qdrant arama hatası: {e}")
        return []
    finally:
        await client.close()

async def rerank_legal_candidates(query: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Gemini kullanarak adayları yeniden sıralar ve en alakalı 3-5 tanesini seçer.
    (Maliyet dostu: Sadece özetler üzerinden analiz yapar)
    """
    if not candidates:
        return []
        
    # Re-ranker için özel promptu yükle (Henüz oluşturmadık, birazdan oluşturacağız)
    # Şimdilik direkt burada tanımlayabiliriz veya daha sonra yaml'a taşıyabiliriz.
    
    # Adayları özet listesi haline getir
    candidate_summaries = []
    for i, cand in enumerate(candidates):
        p = cand["payload"]
        summary_info = {
            "index": i,
            "madde_no": p.get("madde_no", "Belirsiz"),
            "ozet": p.get("ozet", ""),
            "itiraz_argumanlari": p.get("itiraz_argumanlari", [])
        }
        candidate_summaries.append(summary_info)
        
    prompt = f"""Kullanıcının trafik cezası itirazı için en alakalı kanun maddelerini seçmelisin.
KULLANICI OLAYI: "{query}"

AŞAĞIDAKİ ADAY MADDELERİ İNCELE:
{json.dumps(candidate_summaries, ensure_ascii=False, indent=2)}

GÖREVİN:
1. Yukarıdaki maddelerden hangileri bu cezaya itiraz etmek için EN UYGUN ve EN GÜÇLÜ hukuki dayanağı sunar?
2. En alakalı en fazla 4 maddenin INDEX numarasını alaka düzeyine göre sıralı bir liste olarak döndür.
3. Yanıtın sadece şu formatta bir JSON olmalıdır: {{"top_indices": [2, 0, 5]}}
"""

    try:
        # Gemini ile hızlı ve ucuz reranking
        response = genai_client.models.generate_content(
            model=settings.GEMINI_MODEL,
            config={
                "response_mime_type": "application/json",
            },
            contents=prompt
        )
        
        result = json.loads(response.text)
        top_indices = result.get("top_indices", [])
        
        # Seçilen maddeleri asıl listeden çek
        final_selection = []
        for idx in top_indices:
            if 0 <= idx < len(candidates):
               final_selection.append(candidates[idx])
               
        return final_selection
    except Exception as e:
        print(f"❌ Re-ranking hatası: {e}")
        # Hata durumunda Qdrant'tan gelen ilk 3 sonucu güvenli liman olarak döndür
        return candidates[:3]
