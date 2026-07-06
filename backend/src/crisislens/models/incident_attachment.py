"""IncidentAttachment ORM model — file attachments linked to incidents."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from crisislens.models.incident import Incident
    from crisislens.models.user import User


class IncidentAttachment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Document or file attachment associated with an incident."""

    __tablename__ = "incident_attachments"
    __table_args__ = (
        Index("ix_incident_attachments_incident_id", "incident_id"),
        Index("ix_incident_attachments_uploaded_by_id", "uploaded_by_id"),
    )

    incident_id: Mapped[str] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
    )
    uploaded_by_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(128), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    storage_provider: Mapped[str] = mapped_column(String(64), nullable=False, default="local")
    checksum_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)

    incident: Mapped[Incident] = relationship(back_populates="attachments")
    uploaded_by: Mapped[User | None] = relationship(back_populates="uploaded_attachments")
