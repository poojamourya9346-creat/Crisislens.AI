"""Audit logging application service."""

from crisislens.infrastructure.repositories.implementations import AuditLogRepository
from crisislens.models.audit_log import AuditLog
from crisislens.models.enums import AuditAction
from sqlalchemy.ext.asyncio import AsyncSession


class AuditService:
    """Records immutable audit trail entries."""

    ENTITY_INCIDENT = "incident"

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._audit_repo = AuditLogRepository(session)

    async def log_incident_created(
        self,
        *,
        user_id: str | None,
        incident_id: str,
        summary: str,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_id: str | None = None,
    ) -> None:
        """Record incident creation."""
        await self._record(
            user_id=user_id,
            action=AuditAction.CREATE,
            entity_id=incident_id,
            description=summary,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
        )

    async def log_incident_updated(
        self,
        *,
        user_id: str | None,
        incident_id: str,
        changes: dict,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_id: str | None = None,
    ) -> None:
        """Record incident update."""
        await self._record(
            user_id=user_id,
            action=AuditAction.UPDATE,
            entity_id=incident_id,
            description=f"Incident {incident_id} updated.",
            changes=changes,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
        )

    async def log_incident_deleted(
        self,
        *,
        user_id: str | None,
        incident_id: str,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_id: str | None = None,
    ) -> None:
        """Record incident deletion."""
        await self._record(
            user_id=user_id,
            action=AuditAction.DELETE,
            entity_id=incident_id,
            description=f"Incident {incident_id} deleted.",
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
        )

    async def _record(
        self,
        *,
        user_id: str | None,
        action: AuditAction,
        entity_id: str,
        description: str,
        changes: dict | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_id: str | None = None,
    ) -> None:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=self.ENTITY_INCIDENT,
            entity_id=entity_id,
            description=description,
            changes=changes,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
        )
        await self._audit_repo.add(entry)
