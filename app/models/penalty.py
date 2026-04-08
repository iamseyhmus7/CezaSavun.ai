from pydantic import BaseModel, Field
from enum import Enum
from datetime import date
from typing import Optional

class PenaltyCategory(str, Enum):
    HIZ_IHLALI = "hiz_ihlali"
    KIRMIZI_ISIK = "kirmizi_isik"
    HATALI_PARK = "hatali_park"
    ALKOL = "alkol"
    EMNIYET_KEMERI = "emniyet_kemeri"
    DIGER = "diger"

class PenaltyDetail(BaseModel):
    penalty_category: PenaltyCategory
    penalty_code: Optional[str] = None
    penalty_amount: Optional[float] = None
    penalty_date: Optional[date] = None
    penalty_location: Optional[str] = None
    vehicle_plate: Optional[str] = None
    confidence_score: float = Field(default=0.0, ge=0, le=1)
    required_evidence: list[str] = []
    raw_ocr_text: Optional[str] = None
