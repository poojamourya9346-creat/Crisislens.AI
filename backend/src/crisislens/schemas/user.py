"""User Pydantic schemas."""

from datetime import datetime

from pydantic import EmailStr, Field

from crisislens.models.enums import UserRole
from crisislens.schemas.base import BaseSchema, UUIDSchema


class UserBase(BaseSchema):
    """Shared user fields."""

    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    role: UserRole = UserRole.CITIZEN
    organization: str | None = Field(default=None, max_length=255)
    is_active: bool = True
    is_verified: bool = False


class UserCreate(UserBase):
    """Schema for creating a user."""

    hashed_password: str = Field(min_length=8, max_length=255)


class UserUpdate(BaseSchema):
    """Schema for partial user updates."""

    email: EmailStr | None = None
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    role: UserRole | None = None
    organization: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    is_verified: bool | None = None
    last_login_at: datetime | None = None


class UserRead(UUIDSchema, UserBase):
    """Schema for reading a user."""

    last_login_at: datetime | None = None
