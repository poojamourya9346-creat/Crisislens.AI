"""Notification ORM model — user alerts and crisis communications."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from crisislens.models.enums import NotificationChannel

if TYPE_CHECKING:
    from crisislens.models.incident import Incident
    from crisislens.models.user import User


class Notification(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Notification delivered or queued for a platform user."""

    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_user_id", "user_id"),
        Index("ix_notifications_incident_id", "incident_id"),
        Index("ix_notifications_is_read", "is_read"),
        Index("ix_notifications_channel", "channel"),
        Index("ix_notifications_user_unread", "user_id", "is_read"),
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    incident_id: Mapped[str | None] = mapped_column(
        ForeignKey("incidents.id", ondelete="SET NULL"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    channel: Mapped[NotificationChannel] = mapped_column(nullable=False)
    priority: Mapped[str] = mapped_column(String(32), nullable=False, default="normal")
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    user: Mapped[User] = relationship(back_populates="notifications")
    incident: Mapped[Incident | None] = relationship(back_populates="notifications")
