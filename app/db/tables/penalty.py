from sqlalchemy import Column, String, Numeric, Date, ForeignKey, DateTime, Uuid, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, backref
import uuid
from app.db.base import Base

class Penalty(Base):
    __tablename__ = "penalties"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False) # hiz_ihlali, kirmizi_isik, vb.
    penalty_code = Column(String(20), nullable=True) # KTK maddesi
    amount = Column(Numeric(10, 2), nullable=True)
    penalty_date = Column(Date, nullable=True)
    location = Column(String(255), nullable=True)
    vehicle_plate = Column(String(20), nullable=True)
    image_path = Column(String(500), nullable=True) # Yüklenen tutanak görseli
    ocr_result = Column(JSON, nullable=True) # Classifier çıktısı
    status = Column(String(20), default="pending") # pending, processing, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # İlişkiler
    user = relationship("User", backref=backref("penalties", cascade="all, delete-orphan", passive_deletes=True))
