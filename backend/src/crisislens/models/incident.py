"""Incident ORM model — core crisis event entity."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from crisislens.models.enums import IncidentSeverity, IncidentStatus, IncidentType

if TYPE_CHECKING:
    from crisislens.models.ai_report import AIReport
    from crisislens.models.conversation import Conversation
    from crisislens.models.emergency_resource import EmergencyResource
    from crisislens.models.incident_attachment import IncidentAttachment
    from crisislens.models.incident_image import IncidentImage
    from crisislens.models.location import Location
    from crisislens.models.notification import Notification
    from crisislens.models.risk_assessment import RiskAssessment
    from crisislens.models.user import User
    from crisislens.models.weather_snapshot import WeatherSnapshot


class Incident(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Reported or detected community crisis event."""

    __tablename__ = "incidents"
    __table_args__ = (
        Index("ix_incidents_status", "status"),
        Index("ix_incidents_severity", "severity"),
        Index("ix_incidents_type", "incident_type"),
        Index("ix_incidents_reporter_id", "reporter_id"),
        Index("ix_incidents_location_id", "location_id"),
        Index("ix_incidents_reported_at", "reported_at"),
        Index("ix_incidents_status_severity", "status", "severity"),
    )

    reporter_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    location_id: Mapped[str] = mapped_column(
        ForeignKey("locations.id", ondelete="RESTRICT"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    incident_type: Mapped[IncidentType] = mapped_column(nullable=False)
    severity: Mapped[IncidentSeverity] = mapped_column(nullable=False)
    status: Mapped[IncidentStatus] = mapped_column(
        nullable=False,
        default=IncidentStatus.REPORTED,
    )
    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    external_reference: Mapped[str | None] = mapped_column(String(128), nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    reporter: Mapped[User | None] = relationship(
        back_populates="reported_incidents",
        foreign_keys=[reporter_id],
    )
    location: Mapped[Location] = relationship(back_populates="incidents")
    attachments: Mapped[list[IncidentAttachment]] = relationship(
        back_populates="incident",
        cascade="all, delete-orphan",
    )
    images: Mapped[list[IncidentImage]] = relationship(
        back_populates="incident",
        cascade="all, delete-orphan",
    )
    weather_snapshots: Mapped[list[WeatherSnapshot]] = relationship(
        back_populates="incident",
    )
    emergency_resources: Mapped[list[EmergencyResource]] = relationship(
        back_populates="incident",
    )
    risk_assessments: Mapped[list[RiskAssessment]] = relationship(
        back_populates="incident",
        cascade="all, delete-orphan",
    )
    ai_reports: Mapped[list[AIReport]] = relationship(
        back_populates="incident",
        cascade="all, delete-orphan",
    )
    notifications: Mapped[list[Notification]] = relationship(back_populates="incident")
    conversations: Mapped[list[Conversation]] = relationship(back_populates="incident")
