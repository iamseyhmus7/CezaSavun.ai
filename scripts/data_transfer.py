import asyncio
import sqlite3
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text
import sys
import os
import json
import uuid
from datetime import datetime

# Proje dizinini Python yoluna ekle ki 'app' modülünü bulabilsin
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.config import settings
from app.db.base import Base

from app.db.tables.user import User as DBUser
from app.db.tables.penalty import Penalty
from app.db.tables.petition import Petition
from app.db.tables.notification import Notification

# Sabit SQLite Dosya Yolu
SQLITE_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "traffic_defense.db")

def safe_uuid(val):
    if not val:
        return None
    if isinstance(val, str):
        return uuid.UUID(val)
    return val

def safe_date(val):
    if not val:
        return None
    if isinstance(val, str):
        try:
            # Örnek formatlar: "2026-04-14 08:28:46" veya "2026-04-14T08:28:46"
            return datetime.fromisoformat(val.replace(" ", "T"))
        except ValueError:
            return None
    return val

async def transfer_data():
    print("🚀 Veri Kurtarma (Migration) İşlemi Başlıyor...")

    db_url_local = settings.DATABASE_URL.replace("@db:", "@localhost:")
    print(f"🔗 Hedef PostgreSQL Veritabanı: {db_url_local}")
    engine = create_async_engine(db_url_local, echo=False)
    
    print("🛠️ PostgreSQL tabloları oluşturuluyor...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    print(f"📦 Kaynak SQLite Veritabanı: {SQLITE_DB_PATH}")
    if not os.path.exists(SQLITE_DB_PATH):
        print("⚠️ HATA: traffic_defense.db dosyası bulunamadı! Eski veri yoksa işlem iptal ediliyor.")
        return

    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    cursor = sqlite_conn.cursor()

    try:
        async with async_session() as session:
            # --- 1. KULLANICILAR (USERS) TAŞIMA ---
            print("👤 Kullanıcılar (Users) aktarılıyor...")
            cursor.execute("SELECT * FROM users")
            users = cursor.fetchall()
            for u in users:
                user_obj = DBUser(
                    id=safe_uuid(u['id']),
                    name=u['name'],
                    surname=u['surname'],
                    email=u['email'],
                    phone=u['phone'],
                    google_id=u['google_id'],
                    hashed_password=u['hashed_password'],
                    is_verified=bool(u['is_verified']),
                    is_admin=bool(u['is_admin']) if 'is_admin' in u.keys() else False,
                    created_at=safe_date(u['created_at'])
                )
                session.add(user_obj)
            await session.commit()
            print(f"✅ {len(users)} kullanıcı aktarıldı.")

            # --- 2. CEZALAR (PENALTIES) TAŞIMA ---
            print("🚗 Cezalar (Penalties) aktarılıyor...")
            cursor.execute("SELECT * FROM penalties")
            penalties = cursor.fetchall()
            for p in penalties:
                ocr_data = p['ocr_result']
                if isinstance(ocr_data, str) and ocr_data: ocr_data = json.loads(ocr_data)
                
                pen_obj = Penalty(
                    id=safe_uuid(p['id']),
                    user_id=safe_uuid(p['user_id']),
                    category=p['category'],
                    penalty_code=p['penalty_code'],
                    amount=p['amount'],
                    penalty_date=safe_date(p['penalty_date']),
                    location=p['location'],
                    vehicle_plate=p['vehicle_plate'],
                    image_path=p['image_path'],
                    ocr_result=ocr_data,
                    status=p['status'],
                    created_at=safe_date(p['created_at'])
                )
                session.add(pen_obj)
            await session.commit()
            print(f"✅ {len(penalties)} ceza kaydı aktarıldı.")

            # --- 3. DİLEKÇELER (PETITIONS) TAŞIMA ---
            print("📄 Dilekçeler (Petitions) aktarılıyor...")
            cursor.execute("SELECT * FROM petitions")
            petitions = cursor.fetchall()
            for pt in petitions:
                ea_data = pt['evidence_analysis']
                if isinstance(ea_data, str) and ea_data: ea_data = json.loads(ea_data)
                rag_data = pt['rag_references']
                if isinstance(rag_data, str) and rag_data: rag_data = json.loads(rag_data)

                pet_obj = Petition(
                    id=safe_uuid(pt['id']),
                    penalty_id=safe_uuid(pt['penalty_id']),
                    user_id=safe_uuid(pt['user_id']),
                    client_name=pt['client_name'],
                    content=pt['content'],
                    quality_score=pt['quality_score'],
                    evidence_analysis=ea_data,
                    rag_references=rag_data,
                    iteration_count=pt['iteration_count'],
                    status=pt['status'],
                    pdf_path=pt['pdf_path'],
                    created_at=safe_date(pt['created_at'])
                )
                session.add(pet_obj)
            await session.commit()
            print(f"✅ {len(petitions)} dilekçe aktarıldı.")

            # --- 4. BİLDİRİMLER (NOTIFICATIONS) TAŞIMA ---
            print("🔔 Bildirimler (Notifications) aktarılıyor...")
            cursor.execute("SELECT * FROM notifications")
            notifications = cursor.fetchall()
            for n in notifications:
                notif_obj = Notification(
                    id=safe_uuid(n['id']),
                    user_id=safe_uuid(n['user_id']),
                    type=n['type'],
                    title=n['title'],
                    message=n['message'],
                    is_read=bool(n['is_read']),
                    link=n['link'],
                    created_at=safe_date(n['created_at'])
                )
                session.add(notif_obj)
            await session.commit()
            print(f"✅ {len(notifications)} bildirim aktarıldı.")

        print("\n🎉 TÜM VERİLER BAŞARIYLA POSTGRESQL'E TAŞINDI! 🎉")

    except Exception as e:
        print(f"\n❌ Veri aktarımı sırasında kritik bir hata oluştu: {e}")
        await session.rollback()
    finally:
        sqlite_conn.close()
        await engine.dispose()

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(transfer_data())
