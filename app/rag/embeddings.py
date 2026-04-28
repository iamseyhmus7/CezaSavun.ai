from google import genai
from app.config import settings

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

async def embed_text(text: str) -> list[float]:
    """Metni vektöre çevirir"""
    try:
        response = client.models.embed_content(
            # Config'ten gelen değeri kullan!
            model=settings.EMBEDDING_MODEL, 
            contents=text
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Embedding API çağrısında hata: {e}")
        return [0.0] * 768