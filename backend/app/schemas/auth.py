from typing import Optional
from pydantic import BaseModel, Field
from backend.app.models.enums import UserRole


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=100, description="Dispatcher username or email")
    password: str = Field(..., min_length=4, max_length=128, description="Operator passphrase")


class UserProfile(BaseModel):
    id: str
    username: str
    full_name: str
    badge_number: str
    role: UserRole
    agency: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserProfile
