from app.agents.state import AgentState
from app.agents import load_prompt, generate_json_from_gemini
from app.models.evidence import EvidenceAnalysis
from app.redis_publisher import publish_event

async def analyze_evidence(state: AgentState) -> AgentState:
    print("Agent: Evidence Analyzer çalışıyor...")
    if state.get("petition_id"):
        publish_event(state["petition_id"], 2, "processing", "Sistem: Yüklenen kanıt ve bulgular hukuki çerçevede değerlendiriliyor...", True)
    prompt_data = load_prompt("evidence_analyzer")
    
    # Kanıt analizi için gerekli bilgiler
    content = ""
    if state.get("penalty_detail"):
        pd = state["penalty_detail"]
        content += f"Ceza Tipi: {pd.penalty_category}\nMadde: {pd.penalty_code}\nDetay: {pd.raw_ocr_text}"
    else:
        content += "Ceza detayları bulunamadı, genel analiz yap."
        
    result_dict = generate_json_from_gemini(
        system_instruction=prompt_data["system_prompt"],
        content=content
    )
    
    try:
        if result_dict:
            state["evidence_analysis"] = EvidenceAnalysis(**result_dict)
    except Exception as e:
         state["errors"].append(f"Evidence Analyzer parsing hatası: {e}")
         
    return state
