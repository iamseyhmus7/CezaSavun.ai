import pytest
from httpx import AsyncClient
from app.main import app
from app.config import settings

# CATEGORY: smoke

@pytest.mark.timeout(1)
@pytest.mark.asyncio
async def test_smoke_endpoints_availability():
    """
    Scenario: Kritik servis yollarının ayakta olup olmadığının hızlı kontrolü.
    Expected: Tüm servisler 1sn altında beklenen yanıtı vermeli.
    """
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # 1. Swagger UI
        swagger = await ac.get("/docs")
        assert swagger.status_code == 200, f"Swagger docs erisilemez: {swagger.status_code}"

        # 2. Health Check
        health = await ac.get("/health")
        assert health.status_code == 200, f"Health check failed: {health.text}"

        # 3. Korumalı Profil Bilgisi (Unauthenticated)
        me = await ac.get("/api/v1/auth/me")
        assert me.status_code == 401, f"Auth korumasi calismiyor: {me.status_code}"

@pytest.mark.xfail(reason="Logout endpoint henuz implemente edilmedi")
@pytest.mark.asyncio
async def test_logout_endpoint_smoke():
    """Henüz yazılmamış logout endpoint'ini kontrol eder."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        logout = await ac.post("/api/v1/auth/logout")
        assert logout.status_code == 401

@pytest.mark.skipif(not getattr(settings, "METRICS_ENABLED", False), reason="Metrics disabled in settings")
@pytest.mark.asyncio
async def test_metrics_endpoint_availability():
    """
    Scenario: Prometheus metrics endpoint kontrolü.
    Expected: Eğer açıksa 200 dönmeli.
    """
    async with AsyncClient(app=app, base_url="http://test") as ac:
        metrics = await ac.get("/metrics")
        assert metrics.status_code == 200
