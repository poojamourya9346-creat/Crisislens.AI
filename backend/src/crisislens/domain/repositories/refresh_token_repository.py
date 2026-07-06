"""Refresh token repository port."""

from abc import abstractmethod
from datetime import datetime

from crisislens.domain.repositories.base import IRepository
from crisislens.models.refresh_token import RefreshToken


class IRefreshTokenRepository(IRepository[RefreshToken]):
    """Refresh token persistence contract."""

    @abstractmethod
    async def get_by_token_hash(self, token_hash: str) -> RefreshToken | None:
        """Find a refresh token by its hash."""

    @abstractmethod
    async def revoke_by_token_hash(self, token_hash: str, revoked_at: datetime) -> bool:
        """Revoke a refresh token by hash."""

    @abstractmethod
    async def revoke_all_for_user(self, user_id: str, revoked_at: datetime) -> int:
        """Revoke all active refresh tokens for a user."""
