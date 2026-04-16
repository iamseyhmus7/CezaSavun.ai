import asyncio
from app.agents.state import AgentState
from app.agents import load_prompt, client
from app.config import settings
from app.rag.retriever import search_precedents
from google.genai import types
from app.redis_publisher import publish_event

async def write_petition_async(state: AgentState) -> AgentState:
    print("Agent: Legal Writer çalışıyor...")
    if state.get("petition_id"):
        publish_event(state["petition_id"], 3, "processing", "Sistem: Qdrant RAG üzerinden emsal mahkeme kararları taranıyor ve dilekçe yazılıyor...", True)
    prompt_data = load_prompt("legal_writer")
    
    penalty = state.get("penalty_detail")
    evidence = state.get("evidence_analysis")
    
    penalty_code = penalty.penalty_code if penalty else ""
    # Qdrant'tan RAG araması yap
    query = f"Hız ihlali kararları"
    if evidence and evidence.defense_arguments:
        query = " ".join(evidence.defense_arguments)
        
    rag_results = await search_precedents(penalty_code, query, limit=2)
    state["rag_results"] = rag_results
    
    # Kararları string'e dök
    rag_context = "\n\n".join([f"Özet: {r.summary}\nKarar: {r.full_text}" for r in rag_results])
    
    content = f"""
    -- CEZA DETAYI --
    Madde: {penalty_code}
    Tür: {penalty.penalty_category if penalty else "Bilinmiyor"}
    
    -- KANIT ANALİZİ --
    Zayıflıklar: {[v.description for v in evidence.vulnerabilities] if evidence else []}
    Argümanlar: {evidence.defense_arguments if evidence else []}
    
    -- EMSAL KARARLAR (RAG) --
    {rag_context}
    
    Yukarıdaki bilgilere dayanarak dilekçeyi yaz.
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

def write_petition(state: AgentState) -> AgentState:
    # LangGraph içinden asyncio çağrısı
    import builtins
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
        
    if loop and loop.is_running():
        # Zaten bir loop içindeyiz, task olarak atıp beklemesini simüle etsek de asenkron yapıda çalışması lazım
        # MVP aşamasında basitçe senkron çalışmasını sağlayalım (langgraph kısıtlarını aşmak için)
        state = asyncio.run_coroutine_threadsafe(write_petition_async(state), loop).result()
    else:
        state = asyncio.run(write_petition_async(state))
    return state
