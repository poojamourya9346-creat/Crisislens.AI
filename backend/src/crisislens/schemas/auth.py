"""Authentication request and response schemas."""

from datetime import datetime

from pydantic import EmailStr, Field, field_validator

from crisislens.core.auth.constants import MIN_PASSWORD_LENGTH
from crisislens.core.auth.roles import ApplicationRole
from crisislens.schemas.base import BaseSchema


class RegisterRequest(BaseSchema):
    """User self-registration payload."""

    email: EmailStr
    password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    organization: str | None = Field(default=None, max_length=255)
    role: ApplicationRole = ApplicationRole.CITIZEN

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if any(char.isspace() for char in value):
            raise ValueError("Password must not contain whitespace.")
        return value


class LoginRequest(BaseSchema):
    """User login credentials."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshTokenRequest(BaseSchema):
    """Refresh token rotation payload."""

    refresh_token: str = Field(min_length=1)


class LogoutRequest(BaseSchema):
    """Logout payload — revokes the provided refresh token."""

    refresh_token: str = Field(min_length=1)


class TokenResponse(BaseSchema):
    """JWT token pair returned on login and refresh."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Access token lifetime in seconds")


class AuthUserResponse(BaseSchema):
    """Authenticated user profile returned by /auth/me."""

    id: str
    email: EmailStr
    full_name: str
    phone: str | None = None
    role: ApplicationRole
    organization: str | None = None
    is_active: bool
    is_verified: bool
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
