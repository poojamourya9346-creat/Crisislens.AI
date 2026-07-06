"""Hospital ORM model — healthcare facility capacity and availability."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from crisislens.models.location import Location


class Hospital(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Hospital or clinic with bed capacity tracking."""

    __tablename__ = "hospitals"
    __table_args__ = (
        CheckConstraint("available_beds >= 0", name="ck_hospitals_available_beds_non_negative"),
        CheckConstraint(
            "available_beds <= capacity_beds",
            name="ck_hospitals_available_lte_capacity",
        ),
        CheckConstraint("capacity_beds > 0", name="ck_hospitals_capacity_positive"),
        Index("ix_hospitals_location_id", "location_id"),
        Index("ix_hospitals_is_operational", "is_operational"),
        Index("ix_hospitals_name", "name"),
    )

    location_id: Mapped[str] = mapped_column(
        ForeignKey("locations.id", ondelete="RESTRICT"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    capacity_beds: Mapped[int] = mapped_column(Integer, nullable=False)
    available_beds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    emergency_capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    is_operational: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    specialties: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    location: Mapped[Location] = relationship(back_populates="hospitals")
