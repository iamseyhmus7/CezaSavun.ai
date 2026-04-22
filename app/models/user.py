from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2)
    surname: str = Field(..., min_length=2)
    phone: str | None = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    captcha_token: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=2)
    surname: str | None = Field(None, min_length=2)
    phone: str | None = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: UUID
    is_verified: bool
    is_admin: bool = False
    created_at: datetime
    
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str

class GoogleLogin(BaseModel):
    token: str
