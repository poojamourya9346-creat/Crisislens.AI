"""JWT creation and validation."""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from crisislens.core.auth.config import AuthConfig, get_auth_config
from crisislens.core.auth.constants import TOKEN_TYPE_ACCESS, TOKEN_TYPE_REFRESH
from crisislens.core.auth.exceptions import InvalidTokenException, TokenExpiredException
from crisislens.core.auth.roles import ApplicationRole

UTC = timezone.utc


class JWTManager:
    """Encapsulates JWT encoding and decoding operations."""

    def __init__(self, config: AuthConfig | None = None) -> None:
        self._config = config or get_auth_config()

    def create_access_token(
        self,
        *,
        subject: str,
        email: str,
        role: ApplicationRole,
        token_id: str | None = None,
    ) -> str:
        """Create a signed access token."""
        now = datetime.now(UTC)
        expires = now + timedelta(minutes=self._config.access_token_expire_minutes)
        payload = {
            "sub": subject,
            "email": email,
            "role": role.value,
            "type": TOKEN_TYPE_ACCESS,
            "jti": token_id or subject,
            "iat": now,
            "exp": expires,
        }
        return jwt.encode(payload, self._config.secret_key, algorithm=self._config.algorithm)

    def create_refresh_token(
        self,
        *,
        subject: str,
        token_id: str,
    ) -> str:
        """Create a signed refresh token."""
        now = datetime.now(UTC)
        expires = now + timedelta(days=self._config.refresh_token_expire_days)
        payload = {
            "sub": subject,
            "type": TOKEN_TYPE_REFRESH,
            "jti": token_id,
            "iat": now,
            "exp": expires,
        }
        return jwt.encode(payload, self._config.secret_key, algorithm=self._config.algorithm)

    def decode_token(self, token: str, *, expected_type: str | None = None) -> dict[str, Any]:
        """Decode and validate a JWT."""
        try:
            payload = jwt.decode(
                token,
                self._config.secret_key,
                algorithms=[self._config.algorithm],
            )
        except jwt.ExpiredSignatureError as exc:
            raise TokenExpiredException() from exc
        except JWTError as exc:
            raise InvalidTokenException() from exc

        if expected_type and payload.get("type") != expected_type:
            raise InvalidTokenException(message="Invalid token type.")

        return payload


def get_jwt_manager() -> JWTManager:
    """Dependency factory for JWTManager."""
    return JWTManager()
