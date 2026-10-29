from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterUser(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOtpRequest(BaseModel):
    email: EmailStr
    purpose: str = "signup"

class LoginUser(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[dict] = None

class TokenData(BaseModel):
    user_id: str | None = None
    email: EmailStr | None = None

class AuthResponse(BaseModel):
    requires_otp: bool = False
    email: Optional[str] = None
    message: str
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    user: Optional[dict] = None