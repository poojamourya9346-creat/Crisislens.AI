"""Authentication configuration derived from application settings."""

from dataclasses import dataclass

from crisislens.core.config.settings import Settings, get_settings


@dataclass(frozen=True)
class AuthConfig:
    """Immutable authentication configuration."""

    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int

    @classmethod
    def from_settings(cls, settings: Settings | None = None) -> "AuthConfig":
        """Build auth config from application settings."""
        settings = settings or get_settings()
        return cls(
            secret_key=settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
            access_token_expire_minutes=settings.jwt_access_token_expire_minutes,
            refresh_token_expire_days=settings.jwt_refresh_token_expire_days,
        )


def get_auth_config() -> AuthConfig:
    """Return cached authentication configuration."""
    return AuthConfig.from_settings()
