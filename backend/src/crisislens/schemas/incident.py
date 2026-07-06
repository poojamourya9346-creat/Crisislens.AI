"""Incident Pydantic schemas."""

from datetime import datetime

from pydantic import Field

from crisislens.models.enums import IncidentSeverity, IncidentStatus, IncidentType
from crisislens.schemas.base import BaseSchema, UUIDSchema


class IncidentBase(BaseSchema):
    """Shared incident fields."""

    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    incident_type: IncidentType
    severity: IncidentSeverity
    status: IncidentStatus = IncidentStatus.REPORTED
    reported_at: datetime
    resolved_at: datetime | None = None
    external_reference: str | None = Field(default=None, max_length=128)
    metadata: dict | None = Field(default=None, validation_alias="metadata_")


class IncidentCreate(IncidentBase):
    """Schema for creating an incident."""

    reporter_id: str | None = None
    location_id: str


class IncidentUpdate(BaseSchema):
    """Schema for partial incident updates."""

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    incident_type: IncidentType | None = None
    severity: IncidentSeverity | None = None
    status: IncidentStatus | None = None
    location_id: str | None = None
    resolved_at: datetime | None = None
    external_reference: str | None = None
    metadata: dict | None = Field(default=None, validation_alias="metadata_")


class IncidentRead(UUIDSchema, IncidentBase):
    """Schema for reading an incident."""

    reporter_id: str | None = None
    location_id: str
