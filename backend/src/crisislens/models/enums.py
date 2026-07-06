"""Domain enumerations shared across ORM models and schemas."""

import enum


class UserRole(str, enum.Enum):
    """Role of a platform user."""

    CITIZEN = "citizen"
    RESPONDER = "responder"
    NGO = "ngo"
    HOSPITAL = "hospital"
    GOVERNMENT = "government"
    ADMIN = "admin"


class IncidentStatus(str, enum.Enum):
    """Lifecycle status of an incident."""

    REPORTED = "reported"
    VERIFIED = "verified"
    ACTIVE = "active"
    CONTAINED = "contained"
    RESOLVED = "resolved"
    CLOSED = "closed"


class IncidentSeverity(str, enum.Enum):
    """Severity level of an incident."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentType(str, enum.Enum):
    """Category of crisis incident."""

    NATURAL_DISASTER = "natural_disaster"
    FLOOD = "flood"
    EARTHQUAKE = "earthquake"
    FIRE = "fire"
    MEDICAL = "medical"
    INFRASTRUCTURE = "infrastructure"
    SECURITY = "security"
    OTHER = "other"


class ResourceType(str, enum.Enum):
    """Type of emergency resource."""

    MEDICAL = "medical"
    FOOD = "food"
    WATER = "water"
    SHELTER = "shelter"
    PERSONNEL = "personnel"
    EQUIPMENT = "equipment"
    TRANSPORT = "transport"
    OTHER = "other"


class ResourceStatus(str, enum.Enum):
    """Deployment status of an emergency resource."""

    AVAILABLE = "available"
    RESERVED = "reserved"
    DEPLOYED = "deployed"
    DEPLETED = "depleted"


class RiskLevel(str, enum.Enum):
    """Qualitative risk level."""

    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    EXTREME = "extreme"


class NotificationChannel(str, enum.Enum):
    """Delivery channel for notifications."""

    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class MessageType(str, enum.Enum):
    """Type of conversation message."""

    TEXT = "text"
    SYSTEM = "system"
    AI = "ai"


class AuditAction(str, enum.Enum):
    """Auditable action performed in the system."""

    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    ACCESS = "access"
    EXPORT = "export"
