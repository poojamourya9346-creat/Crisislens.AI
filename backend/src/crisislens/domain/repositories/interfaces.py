"""Domain repository interfaces (ports)."""

from abc import abstractmethod

from crisislens.domain.repositories.base import IRepository
from crisislens.models.ai_report import AIReport
from crisislens.models.audit_log import AuditLog
from crisislens.models.conversation import Conversation
from crisislens.models.emergency_resource import EmergencyResource
from crisislens.models.hospital import Hospital
from crisislens.models.incident import Incident
from crisislens.models.incident_attachment import IncidentAttachment
from crisislens.models.incident_image import IncidentImage
from crisislens.models.location import Location
from crisislens.models.message import Message
from crisislens.models.notification import Notification
from crisislens.models.risk_assessment import RiskAssessment
from crisislens.models.shelter import Shelter
from crisislens.models.user import User
from crisislens.models.weather_snapshot import WeatherSnapshot


class IUserRepository(IRepository[User]):
    """User repository port."""

    @abstractmethod
    async def get_by_email(self, email: str) -> User | None:
        """Retrieve a user by email address."""


class ILocationRepository(IRepository[Location]):
    """Location repository port."""


class IIncidentRepository(IRepository[Incident]):
    """Incident repository port."""

    @abstractmethod
    async def get_with_details(self, incident_id: str) -> Incident | None:
        """Retrieve an incident with location, reporter, images, and attachments."""

    @abstractmethod
    async def list_filtered(
        self,
        filters: "IncidentListFilter",
        *,
        offset: int = 0,
        limit: int = 20,
    ) -> list[Incident]:
        """List incidents matching filter criteria."""

    @abstractmethod
    async def count_filtered(self, filters: "IncidentListFilter") -> int:
        """Count incidents matching filter criteria."""

    @abstractmethod
    async def list_by_status(self, status: str, *, offset: int = 0, limit: int = 20) -> list[Incident]:
        """List incidents filtered by status."""

    @abstractmethod
    async def list_by_location(self, location_id: str, *, offset: int = 0, limit: int = 20) -> list[Incident]:
        """List incidents at a given location."""


class IIncidentAttachmentRepository(IRepository[IncidentAttachment]):
    """Incident attachment repository port."""

    @abstractmethod
    async def list_by_incident(self, incident_id: str) -> list[IncidentAttachment]:
        """List attachments for an incident."""


class IIncidentImageRepository(IRepository[IncidentImage]):
    """Incident image repository port."""

    @abstractmethod
    async def list_by_incident(self, incident_id: str) -> list[IncidentImage]:
        """List images for an incident."""


class IWeatherSnapshotRepository(IRepository[WeatherSnapshot]):
    """Weather snapshot repository port."""

    @abstractmethod
    async def list_by_incident(self, incident_id: str) -> list[WeatherSnapshot]:
        """List weather snapshots linked to an incident."""


class IHospitalRepository(IRepository[Hospital]):
    """Hospital repository port."""

    @abstractmethod
    async def list_operational(self, *, offset: int = 0, limit: int = 20) -> list[Hospital]:
        """List operational hospitals."""


class IShelterRepository(IRepository[Shelter]):
    """Shelter repository port."""

    @abstractmethod
    async def list_open(self, *, offset: int = 0, limit: int = 20) -> list[Shelter]:
        """List open shelters."""


class IEmergencyResourceRepository(IRepository[EmergencyResource]):
    """Emergency resource repository port."""

    @abstractmethod
    async def list_by_incident(self, incident_id: str) -> list[EmergencyResource]:
        """List resources assigned to an incident."""


class IRiskAssessmentRepository(IRepository[RiskAssessment]):
    """Risk assessment repository port."""

    @abstractmethod
    async def list_by_incident(self, incident_id: str) -> list[RiskAssessment]:
        """List risk assessments for an incident."""


class IAIReportRepository(IRepository[AIReport]):
    """AI report repository port."""

    @abstractmethod
    async def list_by_incident(self, incident_id: str) -> list[AIReport]:
        """List AI reports for an incident."""


class INotificationRepository(IRepository[Notification]):
    """Notification repository port."""

    @abstractmethod
    async def list_by_user(self, user_id: str, *, unread_only: bool = False) -> list[Notification]:
        """List notifications for a user."""


class IConversationRepository(IRepository[Conversation]):
    """Conversation repository port."""

    @abstractmethod
    async def list_by_incident(self, incident_id: str) -> list[Conversation]:
        """List conversations for an incident."""


class IMessageRepository(IRepository[Message]):
    """Message repository port."""

    @abstractmethod
    async def list_by_conversation(self, conversation_id: str, *, offset: int = 0, limit: int = 50) -> list[Message]:
        """List messages in a conversation."""


class IAuditLogRepository(IRepository[AuditLog]):
    """Audit log repository port."""

    @abstractmethod
    async def list_by_entity(self, entity_type: str, entity_id: str) -> list[AuditLog]:
        """List audit logs for a specific entity."""

    @abstractmethod
    async def list_by_user(self, user_id: str, *, offset: int = 0, limit: int = 50) -> list[AuditLog]:
        """List audit logs for a user."""
