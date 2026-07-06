"""User ORM model — platform actors (citizens, responders, officials)."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from crisislens.models.enums import UserRole

if TYPE_CHECKING:
    from crisislens.models.ai_report import AIReport
    from crisislens.models.audit_log import AuditLog
    from crisislens.models.conversation import Conversation
    from crisislens.models.emergency_resource import EmergencyResource
    from crisislens.models.incident import Incident
    from crisislens.models.incident_attachment import IncidentAttachment
    from crisislens.models.incident_image import IncidentImage
    from crisislens.models.message import Message
    from crisislens.models.notification import Notification
    from crisislens.models.risk_assessment import RiskAssessment


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Registered platform user with role-based access foundation."""

    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_email", "email", unique=True),
        Index("ix_users_role", "role"),
        Index("ix_users_is_active", "is_active"),
    )

    email: Mapped[str] = mapped_column(String(320), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(nullable=False, default=UserRole.CITIZEN)
    organization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    reported_incidents: Mapped[list[Incident]] = relationship(
        back_populates="reporter",
        foreign_keys="Incident.reporter_id",
    )
    uploaded_attachments: Mapped[list[IncidentAttachment]] = relationship(
        back_populates="uploaded_by",
    )
    uploaded_images: Mapped[list[IncidentImage]] = relationship(
        back_populates="uploaded_by",
    )
    risk_assessments: Mapped[list[RiskAssessment]] = relationship(
        back_populates="assessed_by",
    )
    notifications: Mapped[list[Notification]] = relationship(back_populates="user")
    created_conversations: Mapped[list[Conversation]] = relationship(
        back_populates="created_by",
    )
    messages: Mapped[list[Message]] = relationship(back_populates="sender")
    assigned_resources: Mapped[list[EmergencyResource]] = relationship(
        back_populates="assigned_to",
    )
    audit_logs: Mapped[list[AuditLog]] = relationship(back_populates="user")
