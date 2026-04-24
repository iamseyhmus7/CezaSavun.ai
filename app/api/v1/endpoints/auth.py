from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.db.tables.user import User
from app.models.user import (
    UserCreate, UserLogin, UserResponse, Token, GoogleLogin, 
    OTPVerify, ForgotPasswordRequest, PasswordReset, 
    UserUpdate, ChangePasswordRequest
)
from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.email_service import send_otp_email, send_reset_password_email
from app.api.v1.deps import get_current_user
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis
from app.config import settings
import random
import string
from datetime import timedelta
import requests as py_requests

router = APIRouter()

# ── GET /me ─────────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """JWT token ile giriş yapan kullanıcının profil bilgilerini döndürür."""
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_me(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcı bilgilerini (ad, soyad, telefon) günceller."""
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Giriş yapmış kullanıcının şifresini değiştirir veya ilk kez belirler."""
    if current_user.hashed_password:
        # Mevcut şifresi var → eski şifreyi doğrula
        if not verify_password(data.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Mevcut şifre hatalı.")
    # Mevcut şifresi yoksa (Google kullanıcısı) → doğrudan yeni şifre belirleyebilir
    
    current_user.hashed_password = get_password_hash(data.new_password)
    db.add(current_user)
    await db.commit()
    
    return {"message": "Şifreniz başarıyla güncellendi"}

async def get_redis():
    r = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
    try:
        yield r
    finally:
        await r.aclose()

@router.post("/register", response_model=UserResponse, dependencies=[Depends(RateLimiter(times=5, seconds=60))])
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db), r: redis.Redis = Depends(get_redis)):
    # 1. Bot Koruması (Mock reCAPTCHA)
    if user_in.captcha_token == "fail":
        raise HTTPException(status_code=400, detail="Bot tespiti: Geçersiz captcha")
    
    # 2. Kullanıcı Kontrolü
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    
    if user:
        if user.is_verified:
            raise HTTPException(
                status_code=400,
                detail="Bu e-posta adresi zaten kayıtlı.",
            )
        else:
            # Hesap var ama doğrulanmamışsa, şifresini güncelle ve yeni OTP gönder
            user.hashed_password = get_password_hash(user_in.password)
            user.name = user_in.name
            user.surname = user_in.surname
            user.phone = user_in.phone
            await db.commit()
            
            otp = "".join(random.choices(string.digits, k=6))
            await r.setex(f"otp:{user.email}", 300, otp)
            await send_otp_email(user.email, otp)
            return user
            
    # 3. Kullanıcı Oluşturma (Pasif)
    user_data = user_in.model_dump()
    user_data.pop("captcha_token")
    password = user_data.pop("password")
    
    new_user = User(
        **user_data,
        hashed_password=get_password_hash(password),
        is_verified=False
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # 4. OTP Oluşturma ve Saklama (Redis, 5 dk)
    otp = "".join(random.choices(string.digits, k=6))
    await r.setex(f"otp:{new_user.email}", 300, otp)
    
    # 5. E-posta Gönderimi (Mock)
    await send_otp_email(new_user.email, otp)
    
    return new_user

@router.post("/verify-otp")
async def verify_otp(verify_in: OTPVerify, db: AsyncSession = Depends(get_db), r: redis.Redis = Depends(get_redis)):
    # 1. Redis'ten kodu al
    stored_otp = await r.get(f"otp:{verify_in.email}")
    if not stored_otp or stored_otp != verify_in.otp:
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş kod")
    
    # 2. Kullanıcıyı aktif et
    result = await db.execute(select(User).where(User.email == verify_in.email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    user.is_verified = True
    await db.commit()
    await r.delete(f"otp:{verify_in.email}")
    
    return {"message": "Hesabınız başarıyla doğrulandı"}

@router.post("/login", response_model=Token, dependencies=[Depends(RateLimiter(times=5, seconds=60))])
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db), r: redis.Redis = Depends(get_redis)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=400, detail="E-posta veya şifre hatalı")
    
    if not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="E-posta veya şifre hatalı")
        
    if not user.is_verified:
        # Doğrulanmamışsa yeni OTP oluştur ve gönder
        otp = "".join(random.choices(string.digits, k=6))
        await r.setex(f"otp:{user.email}", 300, otp)
        await send_otp_email(user.email, otp)
        raise HTTPException(status_code=403, detail="Hesabınız doğrulanmamış. Yeni e-posta kodu gönderildi.", headers={"X-Error-Code": "unverified"})
    
    access_token = create_access_token(subject=str(user.id))
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/forgot-password", dependencies=[Depends(RateLimiter(times=3, seconds=60))])
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalars().first()
    
    if not user:
        # Güvenlik için e-posta yoksa bile başarılı dönüyoruz ama e-posta göndermiyoruz
        return {"message": "E-posta gönderildi (Eğer kayıtlı ise)"}
    
    # 15 dakika geçerli reset token
    reset_token = create_access_token(subject=str(user.id), expires_delta=timedelta(minutes=15))
    
    # E-posta Gönderimi (Mock)
    await send_reset_password_email(user.email, reset_token)
    
    return {"message": "Şifre sıfırlama talimatları e-posta adresinize gönderildi"}

@router.post("/reset-password")
async def reset_password(data: PasswordReset, db: AsyncSession = Depends(get_db)):
    # Burada handle_google_login'dekine benzer şekilde token doğrulaması yapılacak
    # Basitlik için create_access_token ile üretilen JWT'yi kullanıyoruz
    from jose import jwt, JWTError
    
    try:
        payload = jwt.decode(data.token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="Geçersiz token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş token")
        
    import uuid
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    user.hashed_password = get_password_hash(data.new_password)
    await db.commit()
    
    return {"message": "Şifreniz başarıyla güncellendi"}

@router.post("/google", response_model=Token)
async def login_google(google_in: GoogleLogin, db: AsyncSession = Depends(get_db)):
    try:
        user_info_res = py_requests.get(
            f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={google_in.token}"
        )
        
        if not user_info_res.ok:
            raise HTTPException(status_code=400, detail="Invalid Google token")

        user_info = user_info_res.json()
        google_id = user_info['sub']
        email = user_info['email']
        name = user_info.get('given_name', 'Google')
        surname = user_info.get('family_name', 'User')

        result = await db.execute(
            select(User).where((User.google_id == google_id) | (User.email == email))
        )
        user = result.scalars().first()

        if not user:
            user = User(
                email=email,
                name=name,
                surname=surname,
                google_id=google_id,
                hashed_password=None,
                is_verified=True # Google users are pre-verified
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        elif not user.google_id:
            user.google_id = google_id
            user.is_verified = True
            await db.commit()
            await db.refresh(user)

        access_token = create_access_token(subject=str(user.id))
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
