"""SQLAlchemy ORM models — import all models for metadata registration."""

from crisislens.models.ai_report import AIReport
from crisislens.models.audit_log import AuditLog
from crisislens.models.base import BaseModel
from crisislens.models.conversation import Conversation
from crisislens.models.emergency_resource import EmergencyResource
from crisislens.models.enums import (
    AuditAction,
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
    MessageType,
    NotificationChannel,
    ResourceStatus,
    ResourceType,
    RiskLevel,
    UserRole,
)
from crisislens.models.hospital import Hospital
from crisislens.models.incident import Incident
from crisislens.models.incident_attachment import IncidentAttachment
from crisislens.models.incident_image import IncidentImage
from crisislens.models.location import Location
from crisislens.models.message import Message
from crisislens.models.notification import Notification
from crisislens.models.refresh_token import RefreshToken
from crisislens.models.risk_assessment import RiskAssessment
from crisislens.models.shelter import Shelter
from crisislens.models.user import User
from crisislens.models.weather_snapshot import WeatherSnapshot

__all__ = [
    "AIReport",
    "AuditAction",
    "AuditLog",
    "BaseModel",
    "Conversation",
    "EmergencyResource",
    "Hospital",
    "Incident",
    "IncidentAttachment",
    "IncidentImage",
    "IncidentSeverity",
    "IncidentStatus",
    "IncidentType",
    "Location",
    "Message",
    "MessageType",
    "Notification",
    "NotificationChannel",
    "RefreshToken",
    "ResourceStatus",
    "ResourceType",
    "RiskAssessment",
    "RiskLevel",
    "Shelter",
    "User",
    "UserRole",
    "WeatherSnapshot",
]
