"""Password hashing and token security utilities."""

import hashlib
import secrets

import bcrypt

from crisislens.core.auth.constants import MIN_PASSWORD_LENGTH
from crisislens.core.exceptions.base import ValidationException


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    password_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def validate_password_strength(password: str) -> None:
    """Validate password meets minimum security requirements."""
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValidationException(
            message=f"Password must be at least {MIN_PASSWORD_LENGTH} characters.",
            details={"field": "password"},
        )
    if password.isnumeric() or password.isalpha():
        raise ValidationException(
            message="Password must contain both letters and numbers.",
            details={"field": "password"},
        )


def generate_token_id() -> str:
    """Generate a unique token identifier (jti)."""
    from uuid import uuid4

    return str(uuid4())


def hash_token(token: str) -> str:
    """Create a SHA-256 hash of a token for secure storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_opaque_token() -> str:
    """Generate a cryptographically secure opaque token."""
    return secrets.token_urlsafe(32)
