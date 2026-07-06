"""SQLAlchemy repository implementations (adapters)."""

from sqlalchemy import select

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
from crisislens.infrastructure.repositories.base import SQLAlchemyRepository
from crisislens.models.ai_report import AIReport
from crisislens.models.audit_log import AuditLog
from crisislens.models.conversation import Conversation
from crisislens.models.emergency_resource import EmergencyResource
from crisislens.models.enums import IncidentStatus
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


class UserRepository(SQLAlchemyRepository[User], IUserRepository):
    """SQLAlchemy implementation of IUserRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()


class LocationRepository(SQLAlchemyRepository[Location], ILocationRepository):
    """SQLAlchemy implementation of ILocationRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, Location)


class IncidentRepository(SQLAlchemyRepository[Incident], IIncidentRepository):
    """SQLAlchemy implementation of IIncidentRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, Incident)

    async def list_by_status(
        self,
        status: str,
        *,
        offset: int = 0,
        limit: int = 20,
    ) -> list[Incident]:
        stmt = (
            select(Incident)
            .where(Incident.status == IncidentStatus(status))
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def list_by_location(
        self,
        location_id: str,
        *,
        offset: int = 0,
        limit: int = 20,
    ) -> list[Incident]:
        stmt = (
            select(Incident)
            .where(Incident.location_id == location_id)
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class IncidentAttachmentRepository(
    SQLAlchemyRepository[IncidentAttachment],
    IIncidentAttachmentRepository,
):
    """SQLAlchemy implementation of IIncidentAttachmentRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, IncidentAttachment)

    async def list_by_incident(self, incident_id: str) -> list[IncidentAttachment]:
        stmt = select(IncidentAttachment).where(IncidentAttachment.incident_id == incident_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class IncidentImageRepository(SQLAlchemyRepository[IncidentImage], IIncidentImageRepository):
    """SQLAlchemy implementation of IIncidentImageRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, IncidentImage)

    async def list_by_incident(self, incident_id: str) -> list[IncidentImage]:
        stmt = select(IncidentImage).where(IncidentImage.incident_id == incident_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class WeatherSnapshotRepository(SQLAlchemyRepository[WeatherSnapshot], IWeatherSnapshotRepository):
    """SQLAlchemy implementation of IWeatherSnapshotRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, WeatherSnapshot)

    async def list_by_incident(self, incident_id: str) -> list[WeatherSnapshot]:
        stmt = select(WeatherSnapshot).where(WeatherSnapshot.incident_id == incident_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class HospitalRepository(SQLAlchemyRepository[Hospital], IHospitalRepository):
    """SQLAlchemy implementation of IHospitalRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, Hospital)

    async def list_operational(self, *, offset: int = 0, limit: int = 20) -> list[Hospital]:
        stmt = select(Hospital).where(Hospital.is_operational.is_(True)).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class ShelterRepository(SQLAlchemyRepository[Shelter], IShelterRepository):
    """SQLAlchemy implementation of IShelterRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, Shelter)

    async def list_open(self, *, offset: int = 0, limit: int = 20) -> list[Shelter]:
        stmt = select(Shelter).where(Shelter.is_open.is_(True)).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class EmergencyResourceRepository(
    SQLAlchemyRepository[EmergencyResource],
    IEmergencyResourceRepository,
):
    """SQLAlchemy implementation of IEmergencyResourceRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, EmergencyResource)

    async def list_by_incident(self, incident_id: str) -> list[EmergencyResource]:
        stmt = select(EmergencyResource).where(EmergencyResource.incident_id == incident_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class RiskAssessmentRepository(SQLAlchemyRepository[RiskAssessment], IRiskAssessmentRepository):
    """SQLAlchemy implementation of IRiskAssessmentRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, RiskAssessment)

    async def list_by_incident(self, incident_id: str) -> list[RiskAssessment]:
        stmt = select(RiskAssessment).where(RiskAssessment.incident_id == incident_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class AIReportRepository(SQLAlchemyRepository[AIReport], IAIReportRepository):
    """SQLAlchemy implementation of IAIReportRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, AIReport)

    async def list_by_incident(self, incident_id: str) -> list[AIReport]:
        stmt = select(AIReport).where(AIReport.incident_id == incident_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class NotificationRepository(SQLAlchemyRepository[Notification], INotificationRepository):
    """SQLAlchemy implementation of INotificationRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, Notification)

    async def list_by_user(self, user_id: str, *, unread_only: bool = False) -> list[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            stmt = stmt.where(Notification.is_read.is_(False))
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class ConversationRepository(SQLAlchemyRepository[Conversation], IConversationRepository):
    """SQLAlchemy implementation of IConversationRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, Conversation)

    async def list_by_incident(self, incident_id: str) -> list[Conversation]:
        stmt = select(Conversation).where(Conversation.incident_id == incident_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class MessageRepository(SQLAlchemyRepository[Message], IMessageRepository):
    """SQLAlchemy implementation of IMessageRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, Message)

    async def list_by_conversation(
        self,
        conversation_id: str,
        *,
        offset: int = 0,
        limit: int = 50,
    ) -> list[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.sent_at)
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class AuditLogRepository(SQLAlchemyRepository[AuditLog], IAuditLogRepository):
    """SQLAlchemy implementation of IAuditLogRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, AuditLog)

    async def list_by_entity(self, entity_type: str, entity_id: str) -> list[AuditLog]:
        stmt = select(AuditLog).where(
            AuditLog.entity_type == entity_type,
            AuditLog.entity_id == entity_id,
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def list_by_user(self, user_id: str, *, offset: int = 0, limit: int = 50) -> list[AuditLog]:
        stmt = (
            select(AuditLog)
            .where(AuditLog.user_id == user_id)
            .order_by(AuditLog.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
