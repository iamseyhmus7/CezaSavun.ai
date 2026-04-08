from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, Uuid, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base

class Petition(Base):
    __tablename__ = "petitions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    penalty_id = Column(Uuid(as_uuid=True), ForeignKey("penalties.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=True) # Dilekçe metni
    quality_score = Column(Integer, nullable=True)
    evidence_analysis = Column(JSON, nullable=True) # Ajan 2 çıktısı
    rag_references = Column(JSON, nullable=True) # Kullanılan emsal kararlar
    iteration_count = Column(Integer, default=0) # Revizyon sayısı
    status = Column(String(20), default="generating") # generating, approved, failed
    pdf_path = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # İlişkiler
    penalty = relationship("Penalty", backref="petitions")
    user = relationship("User", backref="petitions")
