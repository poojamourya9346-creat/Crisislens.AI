"""Shelter ORM model — emergency shelter capacity and occupancy."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from crisislens.models.location import Location


class Shelter(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Emergency shelter with occupancy and amenity tracking."""

    __tablename__ = "shelters"
    __table_args__ = (
        CheckConstraint("current_occupancy >= 0", name="ck_shelters_occupancy_non_negative"),
        CheckConstraint(
            "current_occupancy <= capacity",
            name="ck_shelters_occupancy_lte_capacity",
        ),
        CheckConstraint("capacity > 0", name="ck_shelters_capacity_positive"),
        Index("ix_shelters_location_id", "location_id"),
        Index("ix_shelters_is_open", "is_open"),
        Index("ix_shelters_name", "name"),
    )

    location_id: Mapped[str] = mapped_column(
        ForeignKey("locations.id", ondelete="RESTRICT"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    current_occupancy: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    contact_phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    is_open: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    accepts_pets: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    amenities: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    location: Mapped[Location] = relationship(back_populates="shelters")
