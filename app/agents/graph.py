from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.classifier import classify_penalty
from app.agents.retriever_node import retrieve_legal_info
from app.agents.evidence_analyzer import analyze_evidence
from app.agents.legal_writer import write_petition
from app.agents.quality_checker import check_quality

def route_after_classifier(state: AgentState):
    if state.get("errors") and "Girdi metni bulunamadı." in state["errors"]:
        return END
    return "retriever"

def route_after_quality(state: AgentState):
    """Kalite kontrolü sonrası yönlendirme. State DEĞİŞTİRMEZ, sadece yönlendirir."""
    if state.get("quality_status") == "approved":
        print(f"✅ Dilekçe onaylandı! Skor: {state.get('quality_score')}")
        return END
    
    # iteration_count zaten quality_checker node'unda artırılıyor
    if state.get("iteration_count", 0) >= 3:
        print("⚠️ Maksimum 3 revizyon döngüsüne ulaşıldı. Zorla sonlandırılıyor.")
        return END
    
    print(f"🔄 Dilekçe reddedildi. Yeniden yazılıyor... (Tur: {state.get('iteration_count', 0)}/3)")
    return "legal_writer"

# LangGraph oluştur
workflow = StateGraph(AgentState)

# Düğümleri ekle
workflow.add_node("classifier", classify_penalty)
workflow.add_node("retriever", retrieve_legal_info)
workflow.add_node("evidence_analyzer", analyze_evidence)
workflow.add_node("legal_writer", write_petition)
workflow.add_node("quality_checker", check_quality)

# Kenarları (Edges) bağla
workflow.set_entry_point("classifier")
workflow.add_conditional_edges("classifier", route_after_classifier)
workflow.add_edge("retriever", "evidence_analyzer")
workflow.add_edge("evidence_analyzer", "legal_writer")
workflow.add_edge("legal_writer", "quality_checker")
workflow.add_conditional_edges("quality_checker", route_after_quality)

app_graph = workflow.compile()

