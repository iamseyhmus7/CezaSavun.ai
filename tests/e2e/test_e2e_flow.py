import pytest
from httpx import AsyncClient
from app.main import app
from app.config import settings
from httpx import AsyncClient, ASGITransport
# CATEGORY: e2e

@pytest.mark.asyncio
async def test_complete_auth_lifecycle_flow(mock_redis, override_redis):
    """
    Scenario: Register -> Verify -> Login akışı.
    Expected: Register 200 dönmeli, OTP doğrulanabilmeli ve token alınmalı.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        email = "e2e_architect@test.com"
        
        # 1. Register - Assert eklendi
        reg_resp = await ac.post("/api/v1/auth/register", json={
            "email": email, "password": "Pass123!@#", "name": "E2E", 
            "surname": "Tester", "phone": "5550001122", "captcha_token": "valid"
        })
        assert reg_resp.status_code == 200, f"Register failed: {reg_resp.text}"

        # 2. Login (403 unverified)
        login_fail = await ac.post("/api/v1/auth/login", json={"email": email, "password": "Pass123!@#"})
        assert login_fail.status_code == 403

        # 3. OTP Verify (mock_redis instance'ı conftest'ten geliyor)
        mock_redis.get.return_value = "123456"
        verify_resp = await ac.post("/api/v1/auth/verify-otp", json={"email": email, "otp": "123456"})
        assert verify_resp.status_code == 200

        # 4. Final Login
        login_success = await ac.post("/api/v1/auth/login", json={"email": email, "password": "Pass123!@#"})
        assert login_success.status_code == 200
        assert "access_token" in login_success.json()
        
@pytest.mark.enable_limiter
@pytest.mark.asyncio
async def test_should_block_login_after_max_failed_attempts():
    """Scenario: Brute force koruması. Expected: 429 + Retry-After."""
    limit = settings.LOGIN_RATE_LIMIT
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Aynı client ile istek atarak counter'ın IP/Client bazlı tutulmasını garanti ediyoruz
        for _ in range(limit + 5):
            resp = await ac.post("/api/v1/auth/login", json={
                "email": "brute_force@test.com", "password": "wrong"
            })
        
        assert resp.status_code == 429
        assert "Retry-After" in resp.headers
