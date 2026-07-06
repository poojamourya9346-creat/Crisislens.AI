"""Domain repository interfaces (ports)."""

from crisislens.domain.repositories.base import IRepository
from crisislens.domain.repositories.interfaces import (
    IAIReportRepository,
    IAuditLogRepository,
    IConversationRepository,
    IEmergencyResourceRepository,
    IHospitalRepository,
    IIncidentAttachmentRepository,
    IIncidentImageRepository,
    IIncidentRepository,
    ILocationRepository,
    IMessageRepository,
    INotificationRepository,
    IRiskAssessmentRepository,
    IShelterRepository,
    IUserRepository,
    IWeatherSnapshotRepository,
)

__all__ = [
    "IAIReportRepository",
    "IAuditLogRepository",
    "IConversationRepository",
    "IEmergencyResourceRepository",
    "IHospitalRepository",
    "IIncidentAttachmentRepository",
    "IIncidentImageRepository",
    "IIncidentRepository",
    "ILocationRepository",
    "IMessageRepository",
    "INotificationRepository",
    "IRepository",
    "IRiskAssessmentRepository",
    "IShelterRepository",
    "IUserRepository",
    "IWeatherSnapshotRepository",
]
