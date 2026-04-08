import asyncio
import os
import json
from dotenv import load_dotenv
from qdrant_client.models import PointStruct
from google import genai
from google.genai import types

# Bağımlılıklar
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.rag.qdrant_client import get_qdrant_client, init_qdrant_collection

load_dotenv()

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-pro")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "legal_precedents")

async def generate_synthetic_precedents(count: int = 5):
    """Gemini API kullanarak sentetik mahkeme kararları üretir."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = """
    Sen bir Türk Sulh Ceza Hakimisin. Karayolları Trafik Kanunu'nun (örneğin 51/2-a hız ihlali, 47/1-b kırmızı ışık vb.) iptal edildiği gerçeğe uygun, resmi bir gerekçeli karar metni yaz.
    Lütfen her karar için aşağıdaki JSON objelerinden oluşan bir liste (array) döndür:
    {
      "summary": "Kararın kısa özeti",
      "full_text": "Kararın tam detaylı metni (5-6 cümle)",
      "penalty_code": "Örn: 51/2-a",
      "cancellation_reason": "İptal edilme sebebi (örn: radar uyarı levhası eksikliği)",
      "court": "Örn: Ankara 1. Sulh Ceza Hakimliği",
      "decision_date": "YYYY-MM-DD",
      "decision_no": "2023/123 D.İş",
      "category": "hiz_ihlali (diğerleri: kirmizi_isik, hatali_park, alkol, emniyet_kemeri, diger)"
    }
    """
    
    print(f"{count} adet sentetik karar üretiliyor...")
    
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        data = json.loads(response.text)
        if isinstance(data, dict) and "data" in data:
            data = data["data"]
        
        # Eğer liste değilse tekli obje döndürmüş olabilir
        if not isinstance(data, list):
            data = [data]
            
        print(f"[{len(data)}] adet karar başarıyla üretildi.")
        return data[:count]
    except Exception as e:
        print(f"Sentetik veri üretimi sırasında hata: {e}")
        # Hata durumunda hardcoded örnek koyalım
        return [{
            "summary": "Radar uyarı levhası eksikliği nedeniyle cezanın iptali.",
            "full_text": "Yapılan incelemede, hız ihlalinin tespit edildiği yolda Karayolları Trafik Yönetmeliği uyarınca bulunması zorunlu olan 'radar uyarı levhasının' bulunmadığı, bu nedenle idari işlemin usule aykırı olduğu anlaşıldığından cezanın iptaline karar verilmiştir.",
            "penalty_code": "51/2-a",
            "cancellation_reason": "Radar uyarı levhası eksikliği",
            "court": "Ankara 1. Sulh Ceza Merkezi",
            "decision_date": "2023-05-12",
            "decision_no": "2023/456 D.İş",
            "category": "hiz_ihlali"
        }]

async def seed_qdrant():
    """Üretilen verileri Qdrant'a yükler."""
    await init_qdrant_collection()
    data = await generate_synthetic_precedents(count=5)
    
    if not data:
        print("Yüklenecek veri bulunamadı.")
        return
        
    client = get_qdrant_client()
    
    # Not: Gemini'nin text-embedding-004 modelini kullanarak embed işlemi yapmalıyız
    genai_client = genai.Client(api_key=GEMINI_API_KEY)
    
    points = []
    for idx, item in enumerate(data):
        try:
             # Metinleri vektöre dönüştür
             response = genai_client.models.embed_content(
                 model="models/text-embedding-004",
                 contents=item["summary"] + " " + item["full_text"]
             )
             vector = response.embeddings[0].values
             
             point = PointStruct(
                 id=idx + 1,
                 vector=vector,
                 payload=item
             )
             points.append(point)
        except Exception as e:
             print(f"Embedding hatası: {e}")
             continue
             
    if points:
         await client.upsert(
             collection_name=QDRANT_COLLECTION,
             points=points
         )
         print(f"Toplam {len(points)} adet vektör Qdrant'a yüklendi.")
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(seed_qdrant())
