import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
import os
import sys

# Proje kök dizinini Python yoluna ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# SQLAlchemy Base ve Modelleri Import Et (Alembic'in tabloları görmesi için ŞART)
from app.db.base import Base
# Modellerin import edildiğinden emin olmak için
import app.models.penalty
import app.models.petition
import app.db.tables.user
import app.db.tables.notification

from app.config import settings

config = context.config

# Ortam değişkeninden (K8s veya Docker) gelen DATABASE_URL'i alembic.ini'nin üzerine yaz
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Hedef metadata'yı tanımla
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Asenkron motora ihtiyaç duymadan (sadece string SQL üreterek) migration yapar."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection) -> None:
    """Gerçek migration işlemini tetikler."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

from sqlalchemy.ext.asyncio import create_async_engine

async def run_migrations_online() -> None:
    """Asenkron veritabanı motoru ile migration (Tablo güncelleme) işlemlerini yürütür."""
    # alembic.ini dosyasını tamamen ezip doğrudan K8s ortam değişkenini kullanıyoruz!
    connectable = create_async_engine(
        settings.DATABASE_URL,
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
