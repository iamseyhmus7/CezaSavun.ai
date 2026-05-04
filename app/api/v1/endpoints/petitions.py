from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form
from fastapi.responses import StreamingResponse
import io
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.agents.graph import app_graph
from app.agents.state import AgentState
from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.db.tables.user import User
from app.db.tables.penalty import Penalty
from app.db.tables.petition import Petition

router = APIRouter()

# ── Pydantic Response Modelleri ───────────────────────────────────────────────

class PetitionGenerateResponse(BaseModel):
    petition_id: str
    status: str
    draft_petition: Optional[str] = None
    quality_score: Optional[int] = None
    errors: List[str] = []

class PetitionListItem(BaseModel):
    id: UUID
    client_name: Optional[str]
    vehicle_plate: Optional[str]
    penalty_code: Optional[str]
    status: str
    quality_score: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}

class PetitionDetail(BaseModel):
    id: UUID
    client_name: Optional[str]
    vehicle_plate: Optional[str]
    penalty_code: Optional[str]
    content: Optional[str]
    status: str
    quality_score: Optional[int]
    iteration_count: int
    created_at: datetime
    rag_references: Optional[List[dict]] = None

    model_config = {"from_attributes": True}


# ── POST /generate ────────────────────────────────────────────────────────────

import os
import shutil
import tempfile
import uuid
import app.core.celery_app  # Zorunlu import: FastAPI'nin varsayılan localhost yerine Redis broker'a ulaşması için
from app.agents.tasks import run_petition_generation_task
from app.utils.pdf_generator import generate_petition_pdf
from app.services.s3_service import s3_service

@router.post("/generate", response_model=PetitionGenerateResponse)
async def generate_petition(
    file: UploadFile = File(...),
    client_name: str = Form(""),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Ceza tutanağını alır, SQLite DB'ye taslak kaydını girer,
    Celery üzerinden asenkron LangGraph ajanlarını başlatır 
    ve petition_id döndürür.
    """
    print(f"[generate] Kullanıcı: {current_user.email} | Dosya: {file.filename}")

    # 1. Dosya formatı kontrolü
    allowed_types = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Desteklenmeyen format. JPG, PNG, WEBP veya PDF yükleyin.",
        )

    # 2. Dosyayı S3'e yükle
    file_content = await file.read()
    s3_key = f"uploads/{uuid.uuid4()}_{file.filename}"
    success = s3_service.upload_file(file_content, s3_key)
    
    if not success:
        raise HTTPException(status_code=500, detail="Dosya S3'e yüklenemedi.")

    # 3. Penalty (ceza) geçici kaydı oluştur
    penalty_record = Penalty(
        user_id=current_user.id,
        category="diger",
        status="generating",
        image_path=file.filename
    )
    db.add(penalty_record)
    await db.flush()

    # 4. Petition (dilekçe) geçici kaydı oluştur
    petition_record = Petition(
        user_id=current_user.id,
        penalty_id=penalty_record.id,
        client_name=client_name or None,
        status="generating",
        iteration_count=0
    )
    db.add(petition_record)
    await db.commit()
    await db.refresh(petition_record)

    # 5. Celery görevini tetikle (arkaplana gönder)
    run_petition_generation_task.delay(
        str(petition_record.id),
        s3_key,
        file.content_type,
        file.filename
    )

    print(f"[generate] Görev kuyruğa eklendi. Petition ID: {petition_record.id}")

    return PetitionGenerateResponse(
        petition_id=str(petition_record.id),
        status="generating",
        errors=[]
    )


# ── GET / — Kullanıcının dilekçe geçmişi ─────────────────────────────────────

@router.get("/", response_model=List[PetitionListItem])
async def list_petitions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Giriş yapan kullanıcının tüm dilekçelerini yeniden eskiye sıralar."""
    result = await db.execute(
        select(Petition, Penalty)
        .join(Penalty, Petition.penalty_id == Penalty.id)
        .where(Petition.user_id == current_user.id)
        .order_by(Petition.created_at.desc())
    )
    rows = result.all()

    items = []
    for petition, penalty in rows:
        items.append(
            PetitionListItem(
                id=petition.id,
                client_name=petition.client_name,
                vehicle_plate=penalty.vehicle_plate,
                penalty_code=penalty.penalty_code,
                status=petition.status,
                quality_score=petition.quality_score,
                created_at=petition.created_at,
            )
        )
    return items


# ── GET /{id} — Tek dilekçe detayı ───────────────────────────────────────────

@router.get("/{petition_id}", response_model=PetitionDetail)
async def get_petition(
    petition_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Belirtilen ID'ye sahip dilekçeyi döndürür. Sadece sahibi erişebilir."""
    result = await db.execute(
        select(Petition, Penalty)
        .join(Penalty, Petition.penalty_id == Penalty.id)
        .where(Petition.id == petition_id, Petition.user_id == current_user.id)
    )
    row = result.first()

    if not row:
        raise HTTPException(status_code=404, detail="Dilekçe bulunamadı.")

    petition, penalty = row
    return PetitionDetail(
        id=petition.id,
        client_name=petition.client_name,
        vehicle_plate=penalty.vehicle_plate,
        penalty_code=penalty.penalty_code,
        content=petition.content,
        status=petition.status,
        quality_score=petition.quality_score,
        iteration_count=petition.iteration_count,
        created_at=petition.created_at,
        rag_references=petition.rag_references
    )

@router.get("/{petition_id}/download")
async def download_petition_pdf(
    petition_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Belirtilen ID'ye sahip dilekçenin A4 formatında WeasyPrint PDF'ini oluşturur ve indirir."""
    result = await db.execute(
        select(Petition, Penalty)
        .join(Penalty, Petition.penalty_id == Penalty.id)
        .where(Petition.id == petition_id, Petition.user_id == current_user.id)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Dilekçe bulunamadı veya yetkiniz yok.")
    
    petition, penalty = row
    
    petition_data = {
        'content': petition.content,
        'client_name': petition.client_name,
        'penalty_serial_no': getattr(penalty, 'penalty_serial_no', 'Bilinmiyor')
    }
    
    pdf_bytes = generate_petition_pdf(petition_data)
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="Itiraz_Dilekcesi_{petition.id}.pdf"'
        }
    )

@router.delete("/{petition_id}")
async def delete_petition(
    petition_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Belirtilen ID'ye sahip dilekçeyi siler. Sadece sahibi silebilir."""
    result = await db.execute(
        select(Petition).where(
            Petition.id == petition_id, 
            Petition.user_id == current_user.id
        )
    )
    petition = result.scalars().first()
    
    if not petition:
        raise HTTPException(
            status_code=404, 
            detail="Dilekçe bulunamadı veya silme yetkiniz yok."
        )
    
    await db.delete(petition)
    await db.commit()
    return {"message": "Dilekçe başarıyla silindi"}


class PetitionUpdateRequest(BaseModel):
    content: str

@router.patch("/{petition_id}")
async def update_petition_content(
    petition_id: UUID,
    data: PetitionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Dilekçe metnini günceller. Sadece sahibi düzenleyebilir."""
    result = await db.execute(
        select(Petition).where(
            Petition.id == petition_id,
            Petition.user_id == current_user.id
        )
    )
    petition = result.scalars().first()

    if not petition:
        raise HTTPException(status_code=404, detail="Dilekçe bulunamadı veya düzenleme yetkiniz yok.")

    petition.content = data.content
    await db.commit()
    return {"message": "Dilekçe başarıyla güncellendi"}