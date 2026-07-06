"""RiskAssessment ORM model — structured risk evaluation for incidents."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Numeric, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from crisislens.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from crisislens.models.enums import RiskLevel

if TYPE_CHECKING:
    from crisislens.models.incident import Incident
    from crisislens.models.user import User


class RiskAssessment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Quantitative and qualitative risk assessment linked to an incident."""

    __tablename__ = "risk_assessments"
    __table_args__ = (
        CheckConstraint(
            "risk_score >= 0 AND risk_score <= 100",
            name="ck_risk_assessments_score_range",
        ),
        CheckConstraint(
            "confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100)",
            name="ck_risk_assessments_confidence_range",
        ),
        Index("ix_risk_assessments_incident_id", "incident_id"),
        Index("ix_risk_assessments_assessed_by_id", "assessed_by_id"),
        Index("ix_risk_assessments_risk_level", "risk_level"),
        Index("ix_risk_assessments_assessed_at", "assessed_at"),
    )

    incident_id: Mapped[str] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
    )
    assessed_by_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    risk_level: Mapped[RiskLevel] = mapped_column(nullable=False)
    risk_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    confidence_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    factors: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    incident: Mapped[Incident] = relationship(back_populates="risk_assessments")
    assessed_by: Mapped[User | None] = relationship(back_populates="risk_assessments")
