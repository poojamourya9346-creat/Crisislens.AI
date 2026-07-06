"""IncidentImage ORM model — photographic evidence for incidents."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from crisislens.models.incident import Incident
    from crisislens.models.user import User


class IncidentImage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Image captured or uploaded in relation to an incident."""

    __tablename__ = "incident_images"
    __table_args__ = (
        Index("ix_incident_images_incident_id", "incident_id"),
        Index("ix_incident_images_uploaded_by_id", "uploaded_by_id"),
    )

    incident_id: Mapped[str] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
    )
    uploaded_by_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    image_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    captured_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    incident: Mapped[Incident] = relationship(back_populates="images")
    uploaded_by: Mapped[User | None] = relationship(back_populates="uploaded_images")
