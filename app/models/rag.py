from pydantic import BaseModel
from typing import Optional

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
    summary: str
    full_text: str
    penalty_code: str
    similarity_score: Optional[float] = None
