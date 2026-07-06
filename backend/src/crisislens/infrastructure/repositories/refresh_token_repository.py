"""Refresh token SQLAlchemy repository."""

from datetime import datetime

from sqlalchemy import select, update

from crisislens.domain.repositories.refresh_token_repository import IRefreshTokenRepository
from crisislens.infrastructure.repositories.base import SQLAlchemyRepository
from crisislens.models.refresh_token import RefreshToken


class RefreshTokenRepository(SQLAlchemyRepository[RefreshToken], IRefreshTokenRepository):
    """SQLAlchemy implementation of IRefreshTokenRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, RefreshToken)

    async def get_by_token_hash(self, token_hash: str) -> RefreshToken | None:
        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def revoke_by_token_hash(self, token_hash: str, revoked_at: datetime) -> bool:
        stmt = (
            update(RefreshToken)
            .where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked_at.is_(None),
            )
            .values(revoked_at=revoked_at)
        )
        result = await self._session.execute(stmt)
        await self._session.flush()
        return result.rowcount > 0

    async def revoke_all_for_user(self, user_id: str, revoked_at: datetime) -> int:
        stmt = (
            update(RefreshToken)
            .where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
            )
            .values(revoked_at=revoked_at)
        )
        result = await self._session.execute(stmt)
        await self._session.flush()
        return result.rowcount
