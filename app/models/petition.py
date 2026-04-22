from pydantic import BaseModel, Field
from typing import Literal, Optional
from uuid import UUID

class QualityReport(BaseModel):
    status: Literal["approved", "rejected"]
    quality_score: int = Field(ge=0, le=100)
    feedback: list[str] = []
    critical_issues: list[str] = []

class PetitionResponse(BaseModel):
    id: UUID
    content: str
    quality_score: Optional[int] = None
    status: str
    download_url: Optional[str] = None
    rag_references: Optional[list[dict]] = None
    vehicle_plate: Optional[str] = None
    client_name: Optional[str] = None
    created_at: Optional[str] = None
