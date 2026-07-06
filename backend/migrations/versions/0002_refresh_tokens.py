"""Add refresh_tokens table for JWT refresh token persistence.

Revision ID: 0002_refresh_tokens
Revises: 0001_initial_schema
Create Date: 2026-07-05
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0002_refresh_tokens"
down_revision: str | None = "0001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the refresh_tokens table."""
    import crisislens.models.refresh_token  # noqa: F401
    from crisislens.infrastructure.database.base import Base
    from crisislens.models.refresh_token import RefreshToken

    bind = op.get_bind()
    RefreshToken.__table__.create(bind=bind, checkfirst=True)


def downgrade() -> None:
    """Drop the refresh_tokens table."""
    from crisislens.models.refresh_token import RefreshToken

    bind = op.get_bind()
    RefreshToken.__table__.drop(bind=bind, checkfirst=True)
