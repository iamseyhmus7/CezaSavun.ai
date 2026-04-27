import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi import HTTPException
from app.api.v1.endpoints.auth import register, login
from app.models.user import UserCreate, UserLogin
from app.db.tables.user import User

# CATEGORY: unit

@pytest.fixture
def valid_user_in():
    return UserCreate(
        email="expert@cezasavun.ai",
        name="Expert",
        surname="Tester",
        phone="5550001122",
        password="StrongPassword123!",
        captcha_token="valid_token"
    )

@pytest.mark.asyncio
async def test_should_return_jwt_token_when_login_successful(db_session, mock_redis):
    """
    Scenario: Geçerli kullanıcı bilgileriyle başarılı giriş.
    Expected: access_token dönmeli.
    """
    # Arrange
    login_data = UserLogin(email="test@test.com", password="pass")
    mock_user = MagicMock(spec=User)
    mock_user.id = "6cd4a8d3-303e-4f7f-bb25-3794aad05e5e"
    mock_user.email = "test@test.com"
    mock_user.is_verified = True
    mock_user.hashed_password = "hashed_password"

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_user
    db_session.execute = AsyncMock(return_value=mock_result)

    with patch("app.api.v1.endpoints.auth.verify_password", return_value=True), \
         patch("app.api.v1.endpoints.auth.create_access_token", return_value="fake_jwt"):
        
        # Act
        response = await login(user_in=login_data, db=db_session, r=mock_redis)

        # Assert
        assert response["access_token"] == "fake_jwt"

@pytest.mark.asyncio
async def test_should_not_expose_user_existence_on_wrong_password(db_session, mock_redis):
    """
    Scenario: Var olan ve olmayan kullanıcı için hatalı giriş.
    Expected: Her iki durumda da mesaj ve status kodu birebir aynı olmalı (Enumeration protection).
    """
    # Arrange
    mock_user = MagicMock(spec=User)
    mock_user.is_verified = True
    mock_user.hashed_password = "hash"
    res_exists = MagicMock()
    res_exists.scalars.return_value.first.return_value = mock_user

    res_none = MagicMock()
    res_none.scalars.return_value.first.return_value = None

    with patch("app.api.v1.endpoints.auth.verify_password", return_value=False):
        # Act & Assert
        db_session.execute = AsyncMock(side_effect=[res_exists, res_none])
        
        # 1. Kullanıcı varken hata almalı
        with pytest.raises(HTTPException) as exc1:
            await login(user_in=UserLogin(email="exists@t.com", password="w"), db=db_session, r=mock_redis)
        
        # 2. Kullanıcı yokken hata almalı
        with pytest.raises(HTTPException) as exc2:
            await login(user_in=UserLogin(email="none@t.com", password="w"), db=db_session, r=mock_redis)

        # Mesajlar ve kodlar aynı olmalı
        assert exc1.value.status_code == exc2.value.status_code
        assert exc1.value.detail == exc2.value.detail

@pytest.mark.asyncio
async def test_should_validate_otp_format_written_to_redis(db_session, mock_redis, valid_user_in):
    """
    Scenario: Kayıt sonrası Redis'e yazılan verinin doğruluğu.
    Expected: Key, TTL (300s) ve 6 haneli numerik value formatı doğru olmalı.
    """
    # Arrange
    db_session.execute = AsyncMock(return_value=MagicMock())
    db_session.execute.return_value.scalars.return_value.first.return_value = None

    with patch("app.api.v1.endpoints.auth.get_password_hash", return_value="mock_hash"):
        # Act
        await register(user_in=valid_user_in, db=db_session, r=mock_redis)

    # Assert
    args, kwargs = mock_redis.setex.call_args
    key, ttl, value = args
    assert key == f"otp:{valid_user_in.email}"
    assert ttl == 300
    assert len(value) == 6
    assert value.isdigit()
