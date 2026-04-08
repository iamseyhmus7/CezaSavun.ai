import os
import asyncio
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams
from app.config import settings

QDRANT_URL = settings.QDRANT_URL
QDRANT_API_KEY = settings.QDRANT_API_KEY
QDRANT_COLLECTION = settings.QDRANT_COLLECTION

def get_qdrant_client() -> AsyncQdrantClient:
    """Async Qdrant Client döndürür"""
    return AsyncQdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
    )

async def init_qdrant_collection():
    """Koleksiyon yoksa oluşturur"""
    client = get_qdrant_client()
    try:
        collections_response = await client.get_collections()
        collection_names = [col.name for col in collections_response.collections]
        
        if QDRANT_COLLECTION not in collection_names:
            print(f"[{QDRANT_COLLECTION}] koleksiyonu bulunamadı, oluşturuluyor...")
            await client.create_collection(
                collection_name=QDRANT_COLLECTION,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE),
                # 768 boyutu text-embedding-004 vb. modelleri içindir.
            )
            print(f"[{QDRANT_COLLECTION}] koleksiyonu başarıyla oluşturuldu.")
        else:
            print(f"[{QDRANT_COLLECTION}] koleksiyonu zaten mevcut.")
    except Exception as e:
        print(f"Qdrant bağlantı hatası: {e}")
    finally:
        await client.close()

if __name__ == "__main__":
    import asyncio
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(init_qdrant_collection())
