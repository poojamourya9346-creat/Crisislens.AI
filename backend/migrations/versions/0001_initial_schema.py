"""Initial database schema for CrisisLens AI.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-07-05

Creates all 15 core tables with PostgreSQL native enums, foreign keys,
check constraints, and performance indexes from SQLAlchemy metadata.
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the full CrisisLens AI database schema."""
    import crisislens.models  # noqa: F401 — register all ORM models
    from crisislens.infrastructure.database.base import Base

    bind = op.get_bind()
    Base.metadata.create_all(bind)


def downgrade() -> None:
    """Drop all CrisisLens AI database tables."""
    import crisislens.models  # noqa: F401 — register all ORM models
    from crisislens.infrastructure.database.base import Base

    bind = op.get_bind()
    Base.metadata.drop_all(bind)
