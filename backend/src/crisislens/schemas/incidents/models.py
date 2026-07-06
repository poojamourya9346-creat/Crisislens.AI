"""Incident API request and response schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import Field

from crisislens.models.enums import IncidentSeverity, IncidentStatus, IncidentType
from crisislens.schemas.base import BaseSchema, UUIDSchema


class IncidentImageInput(BaseSchema):
    """Image metadata supplied when creating or updating an incident."""

    image_url: str = Field(min_length=1, max_length=2048)
    thumbnail_url: str | None = Field(default=None, max_length=2048)
    caption: str | None = None


class IncidentAttachmentInput(BaseSchema):
    """Attachment metadata supplied when creating or updating an incident."""

    file_name: str = Field(min_length=1, max_length=255)
    file_url: str = Field(min_length=1, max_length=2048)
    mime_type: str = Field(min_length=1, max_length=128)
    file_size_bytes: int = Field(ge=0)
    checksum_sha256: str | None = Field(default=None, max_length=64)


class IncidentCreateRequest(BaseSchema):
    """Payload for reporting a new incident."""

    title: str = Field(min_length=3, max_length=255, examples=["Flash flood on MG Road"])
    description: str = Field(
        min_length=10,
        examples=["Water level rising rapidly near the market area."],
    )
    category: IncidentType = Field(description="Disaster or crisis category.")
    severity: IncidentSeverity
    status: IncidentStatus = IncidentStatus.REPORTED
    latitude: Decimal = Field(ge=-90, le=90, max_digits=10, decimal_places=7, examples=["12.9716000"])
    longitude: Decimal = Field(ge=-180, le=180, max_digits=10, decimal_places=7, examples=["77.5946000"])
    address: str | None = Field(default=None, max_length=255, examples=["MG Road, Bengaluru"])
    city: str | None = Field(default=None, max_length=128, examples=["Bengaluru"])
    state: str | None = Field(default=None, max_length=128)
    country: str = Field(default="IN", min_length=2, max_length=2)
    postal_code: str | None = Field(default=None, max_length=20)
    images: list[IncidentImageInput] = Field(default_factory=list)
    attachments: list[IncidentAttachmentInput] = Field(default_factory=list)


class IncidentUpdateRequest(BaseSchema):
    """Payload for partial incident updates."""

    title: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = Field(default=None, min_length=10)
    category: IncidentType | None = None
    severity: IncidentSeverity | None = None
    status: IncidentStatus | None = None
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=128)
    state: str | None = Field(default=None, max_length=128)
    country: str | None = Field(default=None, min_length=2, max_length=2)
    postal_code: str | None = Field(default=None, max_length=20)
    images: list[IncidentImageInput] | None = None
    attachments: list[IncidentAttachmentInput] | None = None


class IncidentReporterSummary(BaseSchema):
    """Minimal reporter profile embedded in incident responses."""

    id: str
    full_name: str
    email: str


class IncidentLocationResponse(BaseSchema):
    """Location details embedded in incident responses."""

    id: str
    latitude: Decimal
    longitude: Decimal
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str
    postal_code: str | None = None


class IncidentImageResponse(UUIDSchema):
    """Image linked to an incident."""

    image_url: str
    thumbnail_url: str | None = None
    caption: str | None = None


class IncidentAttachmentResponse(UUIDSchema):
    """Attachment linked to an incident."""

    file_name: str
    file_url: str
    mime_type: str
    file_size_bytes: int


class IncidentResponse(UUIDSchema):
    """Full incident detail returned by the API."""

    title: str
    description: str
    category: IncidentType
    severity: IncidentSeverity
    status: IncidentStatus
    latitude: Decimal
    longitude: Decimal
    address: str | None = None
    city: str | None = None
    images: list[IncidentImageResponse] = Field(default_factory=list)
    attachments: list[IncidentAttachmentResponse] = Field(default_factory=list)
    created_by: IncidentReporterSummary | None = None
    reported_at: datetime
    resolved_at: datetime | None = None
    location_id: str
    reporter_id: str | None = None
