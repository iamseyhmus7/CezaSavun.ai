from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from app.db.session import get_db
from app.db.tables.user import User
from app.config import settings

# Token'ı Authorization: Bearer <token> header'ından çeker
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    JWT token'ı decode eder, user_id çıkarır, DB'den User objesi döndürür.
    Geçersiz/süresi dolmuş token → 401 Unauthorized.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulama başarısız. Lütfen tekrar giriş yapın.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        # JWT'den gelen sub string'ini gerçek UUID objesine dönüştür
        # SQLAlchemy Uuid kolonu str değil uuid.UUID bekler
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if user is None:
        raise credentials_exception

    return user


async def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Admin yetkisi kontrolü. is_admin=False olan kullanıcılar 403 alır."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu sayfaya erişim yetkiniz yok. Yönetici hesabı gerekli.",
        )
    return current_user
