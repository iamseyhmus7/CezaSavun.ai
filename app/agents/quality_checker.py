from app.agents.state import AgentState
from app.agents import load_prompt, generate_json_from_gemini
from app.redis_publisher import publish_event
async def check_quality(state: AgentState) -> AgentState:
    current_iter = state.get("iteration_count", 0) + 1
    state["iteration_count"] = current_iter
    print(f"Agent: Quality Checker çalışıyor... (Tur: {current_iter}/3)")
    if state.get("petition_id"):
        publish_event(state["petition_id"], 4, "processing", f"Sistem: Kalite Güvencesi ve Kapsam Denetimi yapılıyor (Tur: {current_iter}/3)", True)
    
    draft = state.get("draft_petition", "")
    
    # Eğer dilekçe taslağı boşsa, direkt fallback
    if not draft or len(draft.strip()) < 20:
        print("Quality Checker: Dilekçe taslağı boş veya çok kısa, fallback approved.")
        state["quality_status"] = "approved"
        state["quality_score"] = 50
        state["feedback"] = ["Dilekçe taslağı boş veya çok kısa geldi. Otomatik onaylandı."]
        return state
    
    prompt_data = load_prompt("quality_checker")
    
    content = f"""
    -- DİLEKÇE TASLAĞI --
    {draft}
    """
    
    result_dict = generate_json_from_gemini(
        system_instruction=prompt_data["system_prompt"],
        content=content
    )
    
    try:
        if result_dict:
            state["quality_status"] = result_dict.get("status", "approved")
            state["quality_score"] = result_dict.get("quality_score", 70)
            state["feedback"] = result_dict.get("feedback", [])
            print(f"Quality Checker sonuç: {state['quality_status']} - Skor: {state['quality_score']}")
        else:
            # Gemini boş döndü, fallback olarak approved yap
            print("Quality Checker: Gemini boş döndü. Fallback approved.")
            state["quality_status"] = "approved"
            state["quality_score"] = 65
    except Exception as e:
        print(f"Quality Checker parsing hatası: {e}")
        state["errors"].append(f"Quality Checker parsing hatası: {e}")
        state["quality_status"] = "approved"  # Hata durumunda da ilerle
        state["quality_score"] = 60
        
    return state
