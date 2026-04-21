import re
import os
from pypdf import PdfReader
from app.rag.qdrant_client import get_qdrant_client, init_qdrant_collection
from qdrant_client.models import PointStruct
from google import genai
from google.genai import types
from app.config import settings
from app.agents.legal_enricher import enrich_legal_content

def clean_text(text: str) -> str:
    """PDF'den gelen gereksiz boşlukları ve satır sonlarını temizler."""
    if not text:
        return ""
    # Birden fazla boşluğu teke indir, satır sonlarını normalize et
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_ktk_chunks(pdf_path, max_chunk_size=800):
    reader = PdfReader(pdf_path)
    full_text = ""
    for page in reader.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"

    # Madde bazlı böl (Madde 51, Madde 47/A vd.)
    pattern = r'(?=Madde \d+[/A-Z]?\s*[–-])'
    raw_chunks = re.split(pattern, full_text)

    chunks = []
    for chunk in raw_chunks:
        if not chunk.strip():
            continue

        # Madde numarasını çıkar
        madde_match = re.search(r'Madde (\d+[/A-Z]?)', chunk)
        madde_no = madde_match.group(1) if madde_match else "Genel"

        # Uzun maddeler için fıkra bazlı böl
        if len(chunk) > max_chunk_size:
            # Fıkraları böl (a), b), 1), 2) gibi)
            sub_chunks = re.split(r'\n(?=[a-z]\)|[0-9]+\))', chunk)
            for i, sub in enumerate(sub_chunks):
                if sub.strip():
                    chunks.append({
                        "madde_no": madde_no,
                        "chunk_id": f"ktk_{madde_no}_{i}",
                        "text": sub.strip(),
                        "kaynak": "2918 sayılı KTK"
                    })
        else:
            chunks.append({
                "madde_no": madde_no,
                "chunk_id": f"ktk_{madde_no}",
                "text": chunk.strip(),
                "kaynak": "2918 sayılı KTK"
            })

    return chunks

async def process_and_ingest_pdf(file_path: str):
    """PDF dosyasını parçalar, vektörleştirir ve Qdrant'a yükler."""
    # 1. Qdrant bağlantısını başlat ve tabloyu hazırla
    await init_qdrant_collection()
    client = get_qdrant_client()
    
    # 2. Metni Parçala
    chunks = extract_ktk_chunks(file_path)
    
    if not chunks:
        raise ValueError("PDF içinden herhangi bir okunabilir metin çıkarılamadı.")
    print(f"Toplam {len(chunks)} adet chunk (parça) analiz edilip zenginleştirilecek.")
    
    # # TEST İÇİN: Sadece ilk 10 maddeyi al
    # chunks = chunks[:10]
    # print(f"TEST MODU (YENİ PROMPT): Toplam 329 içinden ilk {len(chunks)} adet chunk analiz edilecek.")
    
    # 3. Gemini ile Vektörleştirme
    # SDK'nın varsayılan v1beta ayarını kullanmasına izin veriyoruz
    genai_client = genai.Client(
        api_key=settings.GOOGLE_API_KEY
        # http_options={"api_version": "v1"} satırını tamamen SİLDİK
    )
    points = []
    # Index/ID oluşturmak için uuid kullanabilir veya sayısal id kullanabiliriz
    # Qdrant client dökümanına göre uuid desteklenir
    import uuid
    
    for idx, item in enumerate(chunks):
        try:
             # A. Metni Temizle
             cleaned_text = clean_text(item["text"])
             
             # B. AI Agent ile Zenginleştir (Enrichment)
             print(f"[{idx+1}/{len(chunks)}] Analiz ediliyor: {item['chunk_id']}...")
             enrichment = await enrich_legal_content(cleaned_text)
             
             # C. Vektörleştirme (Embedding)
             # Ajanın kategorisi ve özeti ile temiz metni birleştirerek daha güçlü bir vektör oluşturuyoruz
             embedding_input = f"KATEGORİ: {enrichment.get('kategori', '')}\nÖZET: {enrichment.get('ozet', '')}\nMETİN: {cleaned_text}"
             
             response = genai_client.models.embed_content(
                model="gemini-embedding-001",
                contents=embedding_input,
                config=types.EmbedContentConfig(output_dimensionality=768)
             )
             vector = response.embeddings[0].values
             
             # D. Payload Oluştur (Zenginleştirilmiş)
             payload = {
                 "chunk_id": item["chunk_id"],
                 "madde_no": enrichment.get("madde_no", item["madde_no"]),
                 "fikra_bent": enrichment.get("fikra_bent", "Belirsiz"),
                 "kaynak": item["kaynak"],
                 "text": cleaned_text,
                 # Ajandan gelen profesyonel veriler
                 "ozet": enrichment.get("ozet"),
                 "kategori": enrichment.get("kategori"),
                 "anahtar_kelimeler": enrichment.get("anahtar_kelimeler", []),
                 "itiraz_argumanlari": enrichment.get("itiraz_argumanlari", []),
                 "ceza_tipi": enrichment.get("ceza_tipi", "Yok"),
                 "gorevli_mahkeme": enrichment.get("gorevli_mahkeme", "Yok"),
                 "itiraz_suresi_gun": enrichment.get("itiraz_suresi_gun", 15),
                 "ilgili_emsal": enrichment.get("ilgili_emsal", "Yok")
             }
             
             point = PointStruct(
                 id=str(uuid.uuid4()),
                 vector=vector,
                 payload=payload
             )
             points.append(point)
             print(f"✅ Başarılı: {item['chunk_id']}")
             
        except Exception as e:
             print(f"❌ Hata ({item['chunk_id']}): {e}")
             continue
             
        except Exception as e:
             print(f"Embedding sırasında hata oluştu ({item['chunk_id']}): {e}")
             continue
             
    # 4. Qdrant'a Yükleme (Upsert)
    if points:
         await client.upsert(
             collection_name=settings.QDRANT_COLLECTION,
             points=points
         )
         print(f"[{len(points)}] adet yeni RAG verisi Qdrant'a başarıyla yüklendi!")
    
    await client.close()
    return len(points)
