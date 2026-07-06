"""Extended SQLAlchemy incident repository with filtering and eager loading."""

from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from crisislens.domain.incidents.filter_params import IncidentListFilter
from crisislens.domain.repositories.interfaces import IIncidentRepository
from crisislens.infrastructure.repositories.base import SQLAlchemyRepository
from crisislens.models.enums import IncidentStatus
from crisislens.models.incident import Incident
from crisislens.models.location import Location

_INCIDENT_LOAD_OPTIONS = (
    selectinload(Incident.location),
    selectinload(Incident.reporter),
    selectinload(Incident.images),
    selectinload(Incident.attachments),
)


class IncidentRepository(SQLAlchemyRepository[Incident], IIncidentRepository):
    """SQLAlchemy implementation of IIncidentRepository."""

    def __init__(self, session) -> None:
        super().__init__(session, Incident)

    async def get_with_details(self, incident_id: str) -> Incident | None:
        stmt = (
            select(Incident)
            .where(Incident.id == incident_id)
            .options(*_INCIDENT_LOAD_OPTIONS)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_filtered(
        self,
        filters: IncidentListFilter,
        *,
        offset: int = 0,
        limit: int = 20,
    ) -> list[Incident]:
        stmt = self._build_filter_query(filters)
        stmt = (
            stmt.options(*_INCIDENT_LOAD_OPTIONS)
            .order_by(Incident.reported_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().unique().all())

    async def count_filtered(self, filters: IncidentListFilter) -> int:
        stmt = select(func.count()).select_from(self._build_filter_query(filters).subquery())
        result = await self._session.execute(stmt)
        return int(result.scalar_one())

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
            .options(*_INCIDENT_LOAD_OPTIONS)
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
            .options(*_INCIDENT_LOAD_OPTIONS)
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    def _build_filter_query(self, filters: IncidentListFilter):
        """Build a filtered select statement for incidents."""
        stmt = select(Incident)

        if filters.city:
            stmt = stmt.join(Incident.location)

        if filters.severity is not None:
            stmt = stmt.where(Incident.severity == filters.severity)
        if filters.status is not None:
            stmt = stmt.where(Incident.status == filters.status)
        if filters.incident_type is not None:
            stmt = stmt.where(Incident.incident_type == filters.incident_type)
        if filters.reporter_id is not None:
            stmt = stmt.where(Incident.reporter_id == filters.reporter_id)
        if filters.date_from is not None:
            stmt = stmt.where(Incident.reported_at >= filters.date_from)
        if filters.date_to is not None:
            stmt = stmt.where(Incident.reported_at <= filters.date_to)
        if filters.city:
            stmt = stmt.where(Location.city.ilike(f"%{filters.city}%"))
        if filters.search:
            term = f"%{filters.search}%"
            stmt = stmt.where(
                or_(
                    Incident.title.ilike(term),
                    Incident.description.ilike(term),
                ),
            )

        return stmt
