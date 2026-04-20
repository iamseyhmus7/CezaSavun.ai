from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Uuid, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    type = Column(String(20), default="info")     # info, success, warning, deadline
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    
    # İsteğe bağlı: Hangi ceza veya dilekçe ile ilgili olduğu
    link = Column(String(500), nullable=True)     # Örn: /petition/uuid
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # İlişki
    user = relationship("User", backref="notifications")
