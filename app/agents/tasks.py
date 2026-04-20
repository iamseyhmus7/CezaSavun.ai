import asyncio
import json
import redis
from celery import shared_task
from app.db.session import async_session_maker
from app.db.tables.petition import Petition
from app.db.tables.penalty import Penalty
from app.db.tables.notification import Notification
from app.agents.graph import app_graph
from app.agents.state import AgentState
from app.config import settings

from app.redis_publisher import publish_event
import uuid
from datetime import datetime, timedelta, date

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
            penalty_date = None
            penalty_amount = None
            penalty_location = ""
            
            if penalty_detail:
                # PenaltyDetail bir Pydantic modeli olduğu için attribütleri alıyoruz
                category = getattr(penalty_detail, "penalty_category", "diger")
                penalty_code = getattr(penalty_detail, "penalty_code", None)
                vehicle_plate = getattr(penalty_detail, "vehicle_plate", "")
                penalty_date = getattr(penalty_detail, "penalty_date", None)
                penalty_amount = getattr(penalty_detail, "penalty_amount", None)
                penalty_location = getattr(penalty_detail, "penalty_location", "")
                    
            if hasattr(category, "value"):
                category = category.value
                
            from sqlalchemy import update
            await session.execute(
                update(Penalty).where(Penalty.id == penalty_record_id).values(
                    category=str(category),
                    penalty_code=penalty_code,
                    amount=penalty_amount,
                    penalty_date=penalty_date,
                    location=penalty_location,
                    vehicle_plate=vehicle_plate,
                    # JSON kolonuna yazarken date objeleri hata verdiği için JSON-ready hale getiriyoruz
                    ocr_result=json.loads(penalty_detail.json()) if hasattr(penalty_detail, "json") else (penalty_detail.model_dump(mode='json') if hasattr(penalty_detail, "model_dump") else None),
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

            # Persist Notification
            if ws_status == "completed":
                notif = Notification(
                    user_id=petition_record.user_id,
                    type="success",
                    title=f"✅ Dilekçe Hazır: {vehicle_plate}",
                    message=f"{vehicle_plate} plakalı aracınız için hazırlanan itiraz dilekçesi %{petition_record.quality_score} kalite skoru ile tamamlandı.",
                    link=f"/petition/{petition_id}"
                )
                session.add(notif)
                await session.commit()

@shared_task(name="run_petition_generation", bind=True)
def run_petition_generation_task(self, petition_id: str, file_path: str, mime_type: str, file_name: str):
    print(f"[{self.request.id}] Celery Task Başladı - Petition: {petition_id}")
    asyncio.run(async_run_pipeline(petition_id, file_path, mime_type, file_name))
    print(f"[{self.request.id}] Celery Task Tamamlandı.")
    return True

@shared_task(name="check_deadlines")
def check_objection_deadlines_task():
    """Tüm cezaları tarar ve 15 günlük itiraz süresi yaklaşanlar için bildirim oluşturur."""
    async def run():
        async with async_session_maker() as session:
            from sqlalchemy.future import select
            from sqlalchemy import and_
            
            # Bugünün tarihi
            today = date.today()
            # 15 gün öncesi (İtirazın son günü bugün olanlar)
            # Kritik uyarı: Son 3 gün kalanlar
            
            result = await session.execute(
                select(Penalty).where(Penalty.status == "completed")
            )
            penalties = result.scalars().all()
            
            for penalty in penalties:
                # Ceza tarihi yoksa oluşturulma tarihini baz al
                start_date = penalty.penalty_date or penalty.created_at.date()
                if not start_date: continue
                
                deadline = start_date + timedelta(days=15)
                days_left = (deadline - today).days
                
                # 3 gün veya daha az kalmışsa bildirim oluştur (ve daha önce oluşturulmamışsa)
                if 0 <= days_left <= 3:
                    # Daha önce aynı ceza için benzer bildirim var mı kontrol et
                    check_existing = await session.execute(
                        select(Notification).where(
                            and_(
                                Notification.user_id == penalty.user_id,
                                Notification.title.like(f"%{penalty.vehicle_plate}%"),
                                Notification.type == "deadline"
                            )
                        )
                    )
                    if not check_existing.scalars().first():
                        notif = Notification(
                            user_id=penalty.user_id,
                            type="deadline",
                            title=f"⚠️ İtiraz Süresi Azalıyor: {penalty.vehicle_plate}",
                            message=f"{penalty.penalty_code} kodlu ceza için itiraz süresinin dolmasına {days_left} gün kaldı. Lütfen dilekçenizi kontrol edin.",
                            link=f"/dashboard" # Veya varsa dilekçe linki
                        )
                        session.add(notif)
                        # Real-time WebSocket duyurusu (isteğe bağlı)
                        try:
                            publish_event(str(penalty.user_id), 0, "warning", f"Kritik Süre: {penalty.vehicle_plate} için son {days_left} gün!", True)
                        except: pass
            
            await session.commit()
            
    asyncio.run(run())
    return True
