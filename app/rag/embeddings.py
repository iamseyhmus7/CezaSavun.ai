from google import genai
from app.config import settings

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

async def embed_text(text: str) -> list[float]:
    """Metni text-embedding-004 ile vektöre çevirir"""
    try:
        response = client.models.embed_content(
            model="models/text-embedding-004",
            contents=text
        )
        # Google genai kütüphanesinde embedding verisi
        return response.embeddings[0].values
    except Exception as e:
        print(f"Embedding API çağrısında hata: {e}")
        # Hata durumunda 768 boyutlu sıfır vektörü dön
        return [0.0] * 768
