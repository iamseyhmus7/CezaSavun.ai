from app.agents.state import AgentState
from app.agents import load_prompt, generate_json_from_gemini
from app.models.penalty import PenaltyDetail
from app.redis_publisher import publish_event

def classify_penalty(state: AgentState) -> AgentState:
    print("Agent: Classifier çalışıyor...")
    if state.get("petition_id"):
        publish_event(state["petition_id"], 1, "processing", "Sistem: Görsel OCR ve LLM analizine sokuluyor...", True)
    prompt_data = load_prompt("classifier")
    
    content = state.get("input_text", "Ekteki trafik cezası tutanağını incele.")
    
    # State'ten hem resmi hem de formatını alıyoruz
    image_data = state.get("image_bytes")
    image_mime = state.get("image_mime_type", "image/jpeg") # <--- FORMATI OKU
    
    if not content and not image_data:
        state["errors"].append("Girdi metni veya görsel bulunamadı.")
        return state
        
    result_dict = generate_json_from_gemini(
        system_instruction=prompt_data["system_prompt"],
        content=content,
        image_bytes=image_data,
        image_mime_type=image_mime # <--- FONKSİYONA İLET
    )
    
    try:
        if result_dict:
            if not result_dict.get("penalty_category") or result_dict.get("penalty_category") == "null":
                result_dict["penalty_category"] = "diger"
            
            if "confidence_score" not in result_dict or result_dict["confidence_score"] is None:
                result_dict["confidence_score"] = 0.9 
                
            state["penalty_detail"] = PenaltyDetail(**result_dict)
        else:
            state["penalty_detail"] = PenaltyDetail(
                penalty_category="diger",
                confidence_score=0.1,
                raw_ocr_text="Belge işlenemedi."
            )
    except Exception as e:
        print(f"Classifier parsing hatası: {e}")
        state["penalty_detail"] = PenaltyDetail(
            penalty_category="diger",
            confidence_score=0.1,
            raw_ocr_text="Hata nedeniyle metin işlenemedi."
        )
        state["errors"].append(f"Classifier parsing hatası (Korumalı mod): {e}")
        
    return state