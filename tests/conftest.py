import sys
from unittest.mock import MagicMock, AsyncMock, patch

# WeasyPrint Windows bağımlılık hatasını (GTK+) engellemek için mock'lama
mock_weasyprint = MagicMock()
sys.modules["weasyprint"] = mock_weasyprint

import pytest
import asyncio
from testcontainers.postgres import PostgresContainer
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, backref
from app.db.base import Base
from app.main import app
from app.api.v1.endpoints.auth import get_redis
from app.db.session import get_db

# --- GLOBAL RATE LIMITER MOCK (Conditional) ---
@pytest.fixture(autouse=True)
def manage_rate_limiter(request):
    """
    Varsayılan olarak RateLimiter'ı devre dışı bırakır.
    Sadece @pytest.mark.enable_limiter marker'ı olan testlerde aktif kalır.
    """
    if request.node.get_closest_marker("enable_limiter"):
        yield
    else:
        from fastapi_limiter.depends import RateLimiter
        # FastAPI'nin imza kontrolünü (inspection) bozmamak için gerçek bir asenkron fonksiyon kullanıyoruz
        async def mock_call(self, request=None, response=None):
            return None
        
        with patch.object(RateLimiter, "__call__", side_effect=mock_call, autospec=True):
            yield

# --- REDIS MOCK (Session & Function) ---
@pytest.fixture(scope="session")
def session_mock_redis():
    """FastAPILimiter için session-scoped mock redis."""
    mock = AsyncMock()
    mock.get.return_value = None
    mock.incr.return_value = 1
    mock.eval.return_value = 1
    return mock

@pytest.fixture(scope="function")
def mock_redis():
    """Her test için temizlenen Redis mock."""
    mock = AsyncMock()
    mock.get.return_value = None
    mock.setex.return_value = True
    mock.delete.return_value = True
    return mock

@pytest.fixture(autouse=True)
async def clear_limiter_redis(session_mock_redis):
    """Her test öncesi Rate Limiter mock durumunu tamamen sıfırlar."""
    session_mock_redis.reset_mock()
    session_mock_redis.get.return_value = None
    session_mock_redis.incr.return_value = 1
    session_mock_redis.eval.return_value = 1
    yield

@pytest.fixture(scope="function", autouse=True)
async def initialize_limiter(session_mock_redis):
    """Testler başlamadan önce FastAPILimiter'ı başlatır."""
    from fastapi_limiter import FastAPILimiter
    await FastAPILimiter.init(session_mock_redis)
    yield

# --- POSTGRES & ENGINE ---
@pytest.fixture(scope="session")
def postgres_container():
    container = PostgresContainer("postgres:15-alpine")
    container.start()
    yield container
    container.stop()

@pytest.fixture(scope="function")
async def db_engine(postgres_container):
    """Konteyner bilgilerinden temiz bir Async URL inşa eder."""
    host = postgres_container.get_container_host_ip()
    port = postgres_container.get_exposed_port(5432)
    user = postgres_container.username
    password = postgres_container.password
    db = postgres_container.dbname
    
    url = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{db}"
    # Pool size'ı küçük tutarak loop sorunlarını minimize edebiliriz
    engine = create_async_engine(url, echo=False, pool_size=5, max_overflow=10)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture(scope="function")
async def db_session(db_engine):
    """
    Her test için yeni bir transaction başlatır ve sonunda geri alır (Rollback).
    """
    # Mevcut db_engine (session loop'unda yaratıldı) üzerinden bağlantı alıyoruz.
    # pytest-asyncio 0.23+ ile fixture loop scope'ları doğru ayarlandığında bu çalışacaktır.
    async with db_engine.connect() as connection:
        async with connection.begin() as trans:
            session = AsyncSession(bind=connection, expire_on_commit=False)
            yield session
            await session.close()
            await trans.rollback()

@pytest.fixture(autouse=True)
async def override_redis(mock_redis):
    async def _get_redis_override():
        yield mock_redis
    app.dependency_overrides[get_redis] = _get_redis_override
    yield
    app.dependency_overrides.pop(get_redis, None)

@pytest.fixture(autouse=True)
async def override_db(db_session):
    """FastAPI'nin veritabanı bağımlılığını (get_db), test veritabanımız ile ezer."""
    async def _get_db_override():
        yield db_session
        
    app.dependency_overrides[get_db] = _get_db_override
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture(autouse=True)
def mock_external_services():
    with patch("app.api.v1.endpoints.auth.send_otp_email", new_callable=AsyncMock) as mock_email:
        yield {"email": mock_email}
