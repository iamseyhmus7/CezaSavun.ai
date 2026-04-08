from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.agents.graph import app_graph
from app.agents.state import AgentState

router = APIRouter()

class PetitionResponse(BaseModel):
    status: str
    draft_petition: Optional[str] = None
    quality_score: Optional[int] = None
    errors: list[str] = []

@router.post("/generate", response_model=PetitionResponse)
async def generate_petition(file: UploadFile = File(...)):
    """LangGraph ajanlarını tetikleyerek dilekçe üretir."""
    
    print(f"Backend Tetiklendi! Yeni dosya alındı: {file.filename} ({file.content_type})")
    
    # 1. Dosya formatı kontrolü (Güvenlik ve Multi-Media Desteği)
    allowed_types = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Desteklenmeyen dosya formatı. Lütfen JPG, PNG, WEBP veya PDF yükleyin."
        )
    
    # 2. Dosya içeriği işleniyor (Görüntü byte'lara çevriliyor)
    content = await file.read()
    file_mime_type = file.content_type
    
    # 3. LangGraph state inisyalizasyonu (GÜNCELLENDİ: Artık resim gerçekten modele gidiyor!)
    initial_state = AgentState(
        image_path=file.filename,
        input_text="Lütfen ekteki trafik cezası tutanağını bir savunma avukatı gözüyle detaylıca incele.",
        image_bytes=content,              # <--- SİHİRLİ DOKUNUŞ 1: Resmin kendisi
        image_mime_type=file_mime_type,   # <--- SİHİRLİ DOKUNUŞ 2: Resmin formatı
        penalty_detail=None,
        evidence_analysis=None,
        rag_results=[],
        draft_petition=None,
        quality_score=0,
        quality_status=None,
        feedback=[],
        iteration_count=0,
        errors=[]
    )
    
    # Grafı çalıştır
    print("AI Ajan Zinciri (Orchestrator) başlatılıyor...")
    try:
        final_state = app_graph.invoke(initial_state)
        
        print(f"AI Akışı Tamamlandı. Çıktı Kalite Skoru: {final_state.get('quality_score')}")
        
        return PetitionResponse(
            status=final_state.get("quality_status", "failed"),
            draft_petition=final_state.get("draft_petition"),
            quality_score=final_state.get("quality_score"),
            errors=final_state.get("errors", [])
        )
    except Exception as e:
        print(f"Graf çalışma hatası: {e}")
        return PetitionResponse(status="error", errors=[str(e)])