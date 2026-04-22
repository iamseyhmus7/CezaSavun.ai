from typing import Dict, Any
from app.agents.state import AgentState
from app.rag.retriever import search_legal_context, rerank_legal_candidates
from app.models.rag import RagResult

async def retrieve_legal_info(state: AgentState) -> Dict[str, Any]:
    """
    Kullanıcının durumuyla en alakalı mevzuat maddelerini 
    Qdrant ve Gemini Re-ranker kullanarak bulur.
    """
    print("🔍 İlgili mevzuat maddeleri aranıyor...")
    
    # 1. Sorgu Hazırla (Ceza detayları + Kullanıcı metni)
    penalty_detail = state.get("penalty_detail")
    input_text = state.get("input_text", "")
    
    # Eğer classifier bir ceza türü saptadıysa onu da sorguya ekle
    search_query = input_text
    if penalty_detail:
        category_val = penalty_detail.penalty_category.value if hasattr(penalty_detail.penalty_category, 'value') else str(penalty_detail.penalty_category)
        search_query = f"{category_val} {penalty_detail.penalty_code or ''} {input_text}"
    
    # 2. Qdrant'tan adayları çek (İlk Aşama)
    candidates = await search_legal_context(search_query, limit=15)
    
    if not candidates:
        print("⚠️ Hiçbir mevzuat maddesi bulunamadı.")
        return {"rag_results": []}
    
    # 3. Gemini ile Yeniden Sırala (İkinci Aşama - Re-ranking)
    # Burada sadece en iyi 3-4 taneyi seçiyoruz
    refined_candidates = await rerank_legal_candidates(search_query, candidates)
    
    # 4. RagResult modellerine dönüştür
    results = []
    for cand in refined_candidates:
        p = cand["payload"]
        results.append(RagResult(
            madde_no=p.get("madde_no", "Belirsiz"),
            fikra_bent=p.get("fikra_bent", "Belirsiz"),
            ozet=p.get("ozet", ""),
            text=p.get("text", ""),
            itiraz_argumanlari=p.get("itiraz_argumanlari", []),
            ceza_tipi=p.get("ceza_tipi", "Yok"),
            gorevli_mahkeme=p.get("gorevli_mahkeme", "Yok"),
            itiraz_suresi_gun=p.get("itiraz_suresi_gun", 15),
            ilgili_emsal=p.get("ilgili_emsal", "Yok"),
            similarity_score=cand.get("score")
        ))
    
    print(f"✅ {len(results)} adet kritik mevzuat maddesi seçildi.")
    return {"rag_results": results}
