"""Conversation ORM model — threaded discussions around incidents."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from crisislens.models.incident import Incident
    from crisislens.models.message import Message
    from crisislens.models.user import User


class Conversation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Multi-party conversation, optionally scoped to an incident."""

    __tablename__ = "conversations"
    __table_args__ = (
        Index("ix_conversations_incident_id", "incident_id"),
        Index("ix_conversations_created_by_id", "created_by_id"),
        Index("ix_conversations_is_active", "is_active"),
    )

    incident_id: Mapped[str | None] = mapped_column(
        ForeignKey("incidents.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_by_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    incident: Mapped[Incident | None] = relationship(back_populates="conversations")
    created_by: Mapped[User] = relationship(back_populates="created_conversations")
    messages: Mapped[list[Message]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
    )
