import asyncio
import os
import sys

# Projenin ana klasörünü path'e ekleyelim ki imports sorunsuz çalışsın
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rag.ingestor import process_and_ingest_pdf

async def main():
    file_name = "1.5.2918.pdf"
    file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), file_name)
    
    if not os.path.exists(file_path):
        print(f"HATA: {file_name} dosyası bulunamadı! Lütfen dosyanın proje ana klasöründe olduğundan emin ol.")
        return

    print(f"[{file_name}] PDF dosyası okunuyor, chunk'lanıyor ve Qdrant'a yükleniyor. Bu biraz zaman alabilir...")
    
    try:
        count = await process_and_ingest_pdf(file_path)
        print("="*50)
        print(f"✅ İŞLEM TAMAMLANDI!")
        print(f"✅ Toplam {count} adet hukuki madde (chunk) Qdrant vektör tabanına işlendi.")
        print("="*50)
    except Exception as e:
        print(f"\n❌ Yükleme sırasında bir hata oluştu: {e}")

if __name__ == "__main__":
    asyncio.run(main())
