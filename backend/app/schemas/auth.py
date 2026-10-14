from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    organization_name: Optional[str] = "Demo Organization"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None


class OrganizationResponse(BaseModel):
    id: int
    name: str
    industry: Optional[str] = None
    dpo_name: Optional[str] = None
    dpo_email: Optional[str] = None

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    organization: Optional[OrganizationResponse] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


Token.model_rebuild()
