import asyncio
import json
import redis
from celery import shared_task
from app.db.session import async_session_maker
from app.db.tables.petition import Petition
from app.db.tables.penalty import Penalty
from app.agents.graph import app_graph
from app.agents.state import AgentState
from app.config import settings

from app.redis_publisher import publish_event
import uuid

async def async_run_pipeline(petition_id: str, file_path: str, mime_type: str, file_name: str):
    petition_uuid = uuid.UUID(petition_id)
    """Asenkron db operasyonları için sarmalayıcı."""
    
    # 1. Dosyayı oku
    with open(file_path, "rb") as f:
        image_bytes = f.read()

    # 2. Graph State Başlat (Nodes publish_event atacak)
    initial_state = AgentState(
        petition_id=petition_id,
        image_path=file_name,
        input_text="Lütfen ekteki trafik cezası tutanağını detaylıca incele.",
        image_bytes=image_bytes,
        image_mime_type=mime_type,
        penalty_detail=None,
        evidence_analysis=None,
        rag_results=[],
        draft_petition=None,
        quality_score=0,
        quality_status=None,
        feedback=[],
        iteration_count=0,
        errors=[],
    )

    publish_event(petition_id, 1, "processing", "AI Ajan Zinciri başlatılıyor...", True)

    final_state = None
    try:
        final_state = app_graph.invoke(initial_state)
    except Exception as e:
        publish_event(petition_id, 4, "failed", f"Graf hatası: {str(e)}", False)
        # Update DB to failed
        async with async_session_maker() as session:
            from sqlalchemy import update
            await session.execute(update(Petition).where(Petition.id == petition_uuid).values(status="failed"))
            await session.commit()
        return

    # 3. Sonuçları database'e kaydet
    async with async_session_maker() as session:
        from sqlalchemy.future import select
        
        result = await session.execute(select(Petition).where(Petition.id == petition_uuid))
        petition_record = result.scalars().first()
        
        if petition_record:
            penalty_record_id = petition_record.penalty_id
            
            # Güncelle Penalty
            penalty_detail = final_state.get("penalty_detail")
            
            category = "diger"
            penalty_code = None
            vehicle_plate = ""
            
            if penalty_detail:
                if isinstance(penalty_detail, dict):
                    category = penalty_detail.get("penalty_category", "diger")
                    penalty_code = penalty_detail.get("penalty_code")
                    vehicle_plate = penalty_detail.get("vehicle_plate", "")
                else:
                    category = getattr(penalty_detail, "penalty_category", "diger")
                    penalty_code = getattr(penalty_detail, "penalty_code", None)
                    vehicle_plate = getattr(penalty_detail, "vehicle_plate", "")
                    
            if hasattr(category, "value"):
                category = category.value
                
            from sqlalchemy import update
            await session.execute(
                update(Penalty).where(Penalty.id == penalty_record_id).values(
                    category=str(category),
                    penalty_code=penalty_code,
                    vehicle_plate=vehicle_plate,
                    ocr_result=penalty_detail if isinstance(penalty_detail, dict) else None,
                    status="completed"
                )
            )
            
            # Güncelle Petition
            petition_record.content = final_state.get("draft_petition")
            petition_record.quality_score = final_state.get("quality_score")
            petition_record.status = final_state.get("quality_status") or "failed"
            petition_record.iteration_count = final_state.get("iteration_count", 0)
            
            ea = final_state.get("evidence_analysis")
            petition_record.evidence_analysis = ea.dict() if hasattr(ea, "dict") else ea
            
            await session.commit()
            
            # BİTİŞ YAYINI
            ws_status = "completed" if petition_record.status == "approved" else "failed"
            publish_event(petition_id, 4, ws_status, "AI üretim menzili tamamlandı.", False)

@shared_task(name="run_petition_generation", bind=True)
def run_petition_generation_task(self, petition_id: str, file_path: str, mime_type: str, file_name: str):
    print(f"[{self.request.id}] Celery Task Başladı - Petition: {petition_id}")
    asyncio.run(async_run_pipeline(petition_id, file_path, mime_type, file_name))
    print(f"[{self.request.id}] Celery Task Tamamlandı.")
    return True
