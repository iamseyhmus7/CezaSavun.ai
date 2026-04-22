from pydantic import BaseModel
from typing import Optional, List

class PrecedentGenerate(BaseModel):
    summary: str
    full_text: str
    penalty_code: str
    cancellation_reason: str
    court: str
    decision_date: str
    decision_no: str
    category: str

class RagResult(BaseModel):
    madde_no: str
    fikra_bent: str
    ozet: str
    text: str
    itiraz_argumanlari: List[str]
    ceza_tipi: str
    gorevli_mahkeme: str
    itiraz_suresi_gun: int
    ilgili_emsal: str
    similarity_score: Optional[float] = None
