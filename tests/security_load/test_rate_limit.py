import pytest
from httpx import AsyncClient
from app.main import app
from app.config import settings

# CATEGORY: non-functional

@pytest.mark.enable_limiter
@pytest.mark.asyncio
async def test_rate_limit(mock_redis):
    """
    Scenario: Aynı istemcinin üst üste istekleri.
    Expected: Limit dolunca sistem kilitlenmeli.
    """
    limit = settings.LOGIN_RATE_LIMIT
    
    # TEK BIR CLIENT üzerinden tüm istekleri atıyoruz
    async with AsyncClient(app=app, base_url="http://test") as ac:
        responses = []
        for _ in range(limit + 5):
            resp = await ac.post("/api/v1/auth/login", json={
                "email": "rate_precise@test.com", "password": "x"
            })
            responses.append(resp.status_code)

        # Assert
        assert 429 in responses
        first_429_idx = responses.index(429)
        assert first_429_idx <= limit
        
        # Lockout check: İlk 429'dan sonraki her şey 429 mu?
        assert all(s == 429 for s in responses[first_429_idx:])
