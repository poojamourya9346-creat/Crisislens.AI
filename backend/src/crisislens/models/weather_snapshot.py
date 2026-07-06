"""WeatherSnapshot ORM model — environmental conditions at a point in time."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from crisislens.models.incident import Incident
    from crisislens.models.location import Location


class WeatherSnapshot(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Weather conditions captured for a location, optionally linked to an incident."""

    __tablename__ = "weather_snapshots"
    __table_args__ = (
        Index("ix_weather_snapshots_location_id", "location_id"),
        Index("ix_weather_snapshots_incident_id", "incident_id"),
        Index("ix_weather_snapshots_captured_at", "captured_at"),
    )

    location_id: Mapped[str] = mapped_column(
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=False,
    )
    incident_id: Mapped[str | None] = mapped_column(
        ForeignKey("incidents.id", ondelete="SET NULL"),
        nullable=True,
    )
    temperature_celsius: Mapped[float | None] = mapped_column(Float, nullable=True)
    humidity_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind_speed_kmh: Mapped[float | None] = mapped_column(Float, nullable=True)
    precipitation_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    conditions: Mapped[str | None] = mapped_column(String(128), nullable=True)
    source: Mapped[str] = mapped_column(String(64), nullable=False, default="manual")
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    raw_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    location: Mapped[Location] = relationship(back_populates="weather_snapshots")
    incident: Mapped[Incident | None] = relationship(back_populates="weather_snapshots")
