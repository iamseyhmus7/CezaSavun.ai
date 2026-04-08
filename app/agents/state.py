from typing import TypedDict, Optional, List
from app.models.penalty import PenaltyDetail
from app.models.evidence import EvidenceAnalysis
from app.models.rag import RagResult

class AgentState(TypedDict):
    # Girdi Verileri
    image_path: Optional[str]
    input_text: Optional[str]
    
    # Adım Adım Çıktılar
    penalty_detail: Optional[PenaltyDetail]
    evidence_analysis: Optional[EvidenceAnalysis]
    rag_results: List[RagResult]
    
    # Dilekçe Taslağı
    draft_petition: Optional[str]
    
    # Kalite Kontrol
    quality_score: Optional[int]
    quality_status: Optional[str]
    feedback: List[str]
    
    # Metadatalar
    iteration_count: int
    errors: List[str]
    
    # Resim Verileri
    image_bytes: Optional[bytes]      # <--- Tutarlılık için güncellendi
    image_mime_type: Optional[str]    # <--- Tutarlılık için güncellendi
