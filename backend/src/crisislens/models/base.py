"""Base ORM model re-export for convenience."""

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

# Alias for semantic clarity in the models package
BaseModel = Base

__all__ = ["BaseModel", "Base", "TimestampMixin", "UUIDPrimaryKeyMixin"]
