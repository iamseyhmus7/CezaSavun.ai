from pydantic import BaseModel, Field
from typing import Literal

class Vulnerability(BaseModel):
    type: str
    description: str
    severity: Literal["high", "medium", "low"]

class EvidenceAnalysis(BaseModel):
    evidence_strength: int = Field(ge=0, le=100)
    vulnerabilities: list[Vulnerability]
    defense_arguments: list[str]
    recommended_strategy: Literal["teknik_itiraz", "usul_itiraz", "maddi_hata"]
    additional_evidence_needed: list[str] = []
