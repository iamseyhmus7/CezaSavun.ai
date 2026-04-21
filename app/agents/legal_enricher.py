from app.agents import load_prompt, generate_json_from_gemini

async def enrich_legal_content(text: str) -> dict:
    """
    Ham hukuk metnini Gemini kullanarak analiz eder ve zenginleştirir.
    Projenin genel 'agents' yapısına uygun olarak tasarlanmıştır.
    """
    # Promptu yaml dosyasından yükle
    prompt_data = load_prompt("legal_enricher")
    
    # Gemini'den JSON cevabı üret
    result = generate_json_from_gemini(
        system_instruction=prompt_data["system_prompt"],
        content=f"Lütfen şu maddeyi analiz et:\n\n{text}"
    )
    
    # Eğer Gemini bir liste döndürürse (nadir ama mümkün), ilk elemanı al
    if isinstance(result, list) and len(result) > 0:
        result = result[0]
    
    # Eğer Gemini boş dönerse veya hatalı veri tipi gelirse güvenli bir yapı döndür
    if not result or not isinstance(result, dict):
        return {
            "madde_no": "Belirsiz",
            "fikra_bent": "Belirsiz",
            "kategori": "Diğer",
            "ozet": (text[:300] + "...") if text else "",
            "anahtar_kelimeler": [],
            "itiraz_argumanlari": [],
            "ceza_tipi": "Yok",
            "gorevli_mahkeme": "Yok",
            "itiraz_suresi_gun": 15,
            "ilgili_emsal": "Yok"
        }
        
    return result

