"""Pydantic schemas for request/response validation."""

from crisislens.schemas.base import BaseSchema, TimestampSchema, UUIDSchema
from crisislens.schemas.communication import (
    AuditLogCreate,
    AuditLogRead,
    ConversationCreate,
    ConversationRead,
    MessageCreate,
    MessageRead,
    NotificationCreate,
    NotificationRead,
    NotificationUpdate,
)
from crisislens.schemas.facilities import (
    HospitalCreate,
    HospitalRead,
    HospitalUpdate,
    ShelterCreate,
    ShelterRead,
    ShelterUpdate,
    WeatherSnapshotCreate,
    WeatherSnapshotRead,
)
from crisislens.schemas.incident import IncidentCreate, IncidentRead, IncidentUpdate
from crisislens.schemas.incident_media import (
    IncidentAttachmentCreate,
    IncidentAttachmentRead,
    IncidentImageCreate,
    IncidentImageRead,
)
from crisislens.schemas.intelligence import (
    AIReportCreate,
    AIReportRead,
    EmergencyResourceCreate,
    EmergencyResourceRead,
    EmergencyResourceUpdate,
    RiskAssessmentCreate,
    RiskAssessmentRead,
)
from crisislens.schemas.location import LocationCreate, LocationRead, LocationUpdate
from crisislens.schemas.user import UserCreate, UserRead, UserUpdate

__all__ = [
    "AIReportCreate",
    "AIReportRead",
    "AuditLogCreate",
    "AuditLogRead",
    "BaseSchema",
    "ConversationCreate",
    "ConversationRead",
    "EmergencyResourceCreate",
    "EmergencyResourceRead",
    "EmergencyResourceUpdate",
    "HospitalCreate",
    "HospitalRead",
    "HospitalUpdate",
    "IncidentAttachmentCreate",
    "IncidentAttachmentRead",
    "IncidentCreate",
    "IncidentImageCreate",
    "IncidentImageRead",
    "IncidentRead",
    "IncidentUpdate",
    "LocationCreate",
    "LocationRead",
    "LocationUpdate",
    "MessageCreate",
    "MessageRead",
    "NotificationCreate",
    "NotificationRead",
    "NotificationUpdate",
    "RiskAssessmentCreate",
    "RiskAssessmentRead",
    "ShelterCreate",
    "ShelterRead",
    "ShelterUpdate",
    "TimestampSchema",
    "UserCreate",
    "UserRead",
    "UserUpdate",
    "UUIDSchema",
    "WeatherSnapshotCreate",
    "WeatherSnapshotRead",
]
