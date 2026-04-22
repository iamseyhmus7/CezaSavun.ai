import asyncio
from app.agents.state import AgentState
from app.agents import load_prompt, client
from app.config import settings
from google.genai import types
from app.redis_publisher import publish_event

async def write_petition(state: AgentState) -> AgentState:
    """
    Kıdemli Trafik Hukuku Avukatı rolünde, RAG'dan gelen mevzuat ve emsal kararları 
    kullanarak profesyonel dilekçeyi yazar.
    """
    print("Agent: Legal Writer çalışıyor...")
    if state.get("petition_id"):
        publish_event(state["petition_id"], 3, "processing", "Sistem: Zenginleştirilmiş mevzuat verileri kullanılarak dilekçe yazılıyor...", True)
    
    prompt_data = load_prompt("legal_writer")
    
    penalty = state.get("penalty_detail")
    evidence = state.get("evidence_analysis")
    rag_results = state.get("rag_results", [])
    
    # Kararları ve Mevzuat Bilgilerini string'e dök (Zenginleştirilmiş Metadata Formatı)
    rag_context_list = []
    for r in rag_results:
        context_item = (
            f"MADDE: {r.madde_no} ({r.fikra_bent})\n"
            f"ÖZET: {r.ozet}\n"
            f"İTİRAZ STRATEJİSİ: {', '.join(r.itiraz_argumanlari)}\n"
            f"EMSAL: {r.ilgili_emsal}"
        )
        rag_context_list.append(context_item)
    
    rag_context = "\n\n".join(rag_context_list)
    
    content = f"""
    -- CEZA DETAYI --
    Plaka: {penalty.vehicle_plate if penalty else "Bilinmiyor"}
    Tarih: {penalty.penalty_date if penalty else "Bilinmiyor"}
    Seri No: {penalty.penalty_serial_no if penalty else "Bilinmiyor"}
    Konum: {penalty.penalty_location if penalty else "Bilinmiyor"}
    Madde: {penalty.penalty_code if penalty else "Belirtilmemiş"}
    Kategori: {penalty.penalty_category.value if penalty and hasattr(penalty.penalty_category, 'value') else "Bilinmiyor"}
    Miktar: {penalty.penalty_amount if penalty else "Bilinmiyor"} TL
    
    -- KANIT ANALİZİ --
    Tespit Edilen Açıklar: {[v.description for v in evidence.vulnerabilities] if evidence else []}
    Kullanıcı Savunma Argümanları: {evidence.defense_arguments if evidence else []}
    
    -- İLGİLİ MEVZUAT VE HUKUKİ STRATEJİLER (RAG) --
    {rag_context}
    
    Talimat: Yukarıdaki mevzuat maddelerini, emsal kararları ve özellikle ajan tarafından üretilen 'İTİRAZ STRATEJİSİ' önerilerini kullanarak dilekçeyi yaz.
    """
    
    # Düz string dönüşümü için
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[
                types.Part.from_text(prompt_data["system_prompt"]),
                types.Part.from_text(content)
            ]
        )
        state["draft_petition"] = response.text
    except Exception as e:
        state["errors"].append(f"Legal Writer hatası: {e}")
        
    return state
