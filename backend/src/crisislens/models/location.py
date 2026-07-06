"""Location ORM model — geographic reference for incidents and facilities."""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from crisislens.models.hospital import Hospital
    from crisislens.models.incident import Incident
    from crisislens.models.shelter import Shelter
    from crisislens.models.weather_snapshot import WeatherSnapshot


class Location(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Geographic location with structured address and coordinates."""

    __tablename__ = "locations"
    __table_args__ = (
        Index("ix_locations_city_state", "city", "state"),
        Index("ix_locations_country", "country"),
        Index("ix_locations_geohash", "geohash"),
        Index("ix_locations_coordinates", "latitude", "longitude"),
    )

    latitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    address_line_1: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address_line_2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(128), nullable=True)
    state: Mapped[str | None] = mapped_column(String(128), nullable=True)
    country: Mapped[str] = mapped_column(String(2), nullable=False, default="IN")
    postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    place_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    geohash: Mapped[str | None] = mapped_column(String(12), nullable=True)

    incidents: Mapped[list[Incident]] = relationship(back_populates="location")
    weather_snapshots: Mapped[list[WeatherSnapshot]] = relationship(back_populates="location")
    hospitals: Mapped[list[Hospital]] = relationship(back_populates="location")
    shelters: Mapped[list[Shelter]] = relationship(back_populates="location")
