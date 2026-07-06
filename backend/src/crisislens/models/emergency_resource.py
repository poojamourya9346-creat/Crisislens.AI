"""EmergencyResource ORM model — deployable crisis response resources."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from crisislens.models.enums import ResourceStatus, ResourceType

if TYPE_CHECKING:
    from crisislens.models.incident import Incident
    from crisislens.models.user import User


class EmergencyResource(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Material, personnel, or equipment resource for crisis response."""

    __tablename__ = "emergency_resources"
    __table_args__ = (
        Index("ix_emergency_resources_incident_id", "incident_id"),
        Index("ix_emergency_resources_assigned_to_user_id", "assigned_to_user_id"),
        Index("ix_emergency_resources_status", "status"),
        Index("ix_emergency_resources_resource_type", "resource_type"),
    )

    incident_id: Mapped[str | None] = mapped_column(
        ForeignKey("incidents.id", ondelete="SET NULL"),
        nullable=True,
    )
    assigned_to_user_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    resource_type: Mapped[ResourceType] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    unit: Mapped[str | None] = mapped_column(String(32), nullable=True)
    status: Mapped[ResourceStatus] = mapped_column(
        nullable=False,
        default=ResourceStatus.AVAILABLE,
    )
    deployed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    incident: Mapped[Incident | None] = relationship(back_populates="emergency_resources")
    assigned_to: Mapped[User | None] = relationship(back_populates="assigned_resources")
