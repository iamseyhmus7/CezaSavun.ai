from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.db.tables.user import User
from app.models.user import UserCreate, UserLogin, UserResponse, Token, GoogleLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from uuid import uuid4

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user_data = user_in.model_dump()
    password = user_data.pop("password")
    
    new_user = User(
        **user_data,
        hashed_password=get_password_hash(password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

import requests as py_requests

@router.post("/google", response_model=Token)
async def login_google(google_in: GoogleLogin, db: AsyncSession = Depends(get_db)):
    """
    Real endpoint for Google OAuth2
    Verifies the Access Token via Google UserInfo API.
    """
    try:
        # Verify the Access Token via Google's API
        user_info_res = py_requests.get(
            f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={google_in.token}"
        )
        
        if not user_info_res.ok:
            raise HTTPException(status_code=400, detail="Invalid Google token")

        user_info = user_info_res.json()
        
        # Get the user's Google ID and email.
        google_id = user_info['sub']
        email = user_info['email']
        name = user_info.get('given_name', 'Google')
        surname = user_info.get('family_name', 'User')

        # Check if user exists by google_id or email
        result = await db.execute(
            select(User).where((User.google_id == google_id) | (User.email == email))
        )
        user = result.scalars().first()

        if not user:
            # Create new user
            user = User(
                email=email,
                name=name,
                surname=surname,
                google_id=google_id,
                hashed_password=None # Google users don't have a local password
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        elif not user.google_id:
            # Link existing email account to Google
            user.google_id = google_id
            await db.commit()
            await db.refresh(user)

        access_token = create_access_token(subject=user.id)
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
