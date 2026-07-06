"""Emergency resource, risk assessment, and AI report Pydantic schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import Field

from crisislens.models.enums import ResourceStatus, ResourceType, RiskLevel
from crisislens.schemas.base import BaseSchema, UUIDSchema


class EmergencyResourceBase(BaseSchema):
    """Shared emergency resource fields."""

    resource_type: ResourceType
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    quantity: int = Field(default=1, ge=1)
    unit: str | None = Field(default=None, max_length=32)
    status: ResourceStatus = ResourceStatus.AVAILABLE
    deployed_at: datetime | None = None


class EmergencyResourceCreate(EmergencyResourceBase):
    """Schema for creating an emergency resource."""

    incident_id: str | None = None
    assigned_to_user_id: str | None = None


class EmergencyResourceUpdate(BaseSchema):
    """Schema for partial emergency resource updates."""

    resource_type: ResourceType | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    quantity: int | None = Field(default=None, ge=1)
    unit: str | None = None
    status: ResourceStatus | None = None
    incident_id: str | None = None
    assigned_to_user_id: str | None = None
    deployed_at: datetime | None = None


class EmergencyResourceRead(UUIDSchema, EmergencyResourceBase):
    """Schema for reading an emergency resource."""

    incident_id: str | None = None
    assigned_to_user_id: str | None = None


class RiskAssessmentBase(BaseSchema):
    """Shared risk assessment fields."""

    risk_level: RiskLevel
    risk_score: Decimal = Field(ge=0, le=100, max_digits=5, decimal_places=2)
    confidence_score: Decimal | None = Field(default=None, ge=0, le=100)
    factors: dict = Field(default_factory=dict)
    summary: str | None = None
    assessed_at: datetime
    valid_until: datetime | None = None


class RiskAssessmentCreate(RiskAssessmentBase):
    """Schema for creating a risk assessment."""

    incident_id: str
    assessed_by_id: str | None = None


class RiskAssessmentRead(UUIDSchema, RiskAssessmentBase):
    """Schema for reading a risk assessment."""

    incident_id: str
    assessed_by_id: str | None = None


class AIReportBase(BaseSchema):
    """Shared AI report fields."""

    report_type: str = Field(min_length=1, max_length=64)
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    structured_content: dict | None = None
    model_name: str | None = Field(default=None, max_length=128)
    model_version: str | None = Field(default=None, max_length=64)
    prompt_tokens: int | None = Field(default=None, ge=0)
    completion_tokens: int | None = Field(default=None, ge=0)
    generated_at: datetime


class AIReportCreate(AIReportBase):
    """Schema for creating an AI report."""

    incident_id: str


class AIReportRead(UUIDSchema, AIReportBase):
    """Schema for reading an AI report."""

    incident_id: str
