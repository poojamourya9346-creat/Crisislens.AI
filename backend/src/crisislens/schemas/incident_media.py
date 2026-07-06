"""Incident attachment and image Pydantic schemas."""

from datetime import datetime

from pydantic import Field

from crisislens.schemas.base import BaseSchema, UUIDSchema


class IncidentAttachmentBase(BaseSchema):
    """Shared incident attachment fields."""

    file_name: str = Field(min_length=1, max_length=255)
    file_url: str = Field(min_length=1, max_length=2048)
    mime_type: str = Field(min_length=1, max_length=128)
    file_size_bytes: int = Field(ge=0)
    storage_provider: str = Field(default="local", max_length=64)
    checksum_sha256: str | None = Field(default=None, max_length=64)


class IncidentAttachmentCreate(IncidentAttachmentBase):
    """Schema for creating an incident attachment."""

    incident_id: str
    uploaded_by_id: str | None = None


class IncidentAttachmentRead(UUIDSchema, IncidentAttachmentBase):
    """Schema for reading an incident attachment."""

    incident_id: str
    uploaded_by_id: str | None = None


class IncidentImageBase(BaseSchema):
    """Shared incident image fields."""

    image_url: str = Field(min_length=1, max_length=2048)
    thumbnail_url: str | None = Field(default=None, max_length=2048)
    caption: str | None = None
    width: int | None = Field(default=None, ge=1)
    height: int | None = Field(default=None, ge=1)
    captured_at: datetime | None = None


class IncidentImageCreate(IncidentImageBase):
    """Schema for creating an incident image."""

    incident_id: str
    uploaded_by_id: str | None = None


class IncidentImageRead(UUIDSchema, IncidentImageBase):
    """Schema for reading an incident image."""

    incident_id: str
    uploaded_by_id: str | None = None
