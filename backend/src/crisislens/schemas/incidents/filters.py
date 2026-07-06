"""Incident list query parameters for filtering, search, and pagination."""

from datetime import datetime

from fastapi import Query
from pydantic import Field

from crisislens.core.constants.app_constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from crisislens.models.enums import IncidentSeverity, IncidentStatus, IncidentType
from crisislens.schemas.base import BaseSchema


class IncidentListQuery(BaseSchema):
    """Validated query parameters for listing incidents."""

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE)
    severity: IncidentSeverity | None = None
    status: IncidentStatus | None = None
    category: IncidentType | None = Field(default=None, description="Disaster type filter.")
    city: str | None = Field(default=None, max_length=128)
    reporter_id: str | None = Field(default=None, description="Filter by reporter user ID.")
    date_from: datetime | None = Field(default=None, description="Filter incidents reported on or after this date.")
    date_to: datetime | None = Field(default=None, description="Filter incidents reported on or before this date.")
    search: str | None = Field(default=None, min_length=1, max_length=255, description="Search title and description.")


def incident_list_query_params(
    page: int = Query(1, ge=1, description="Page number (1-based)."),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description="Items per page."),
    severity: IncidentSeverity | None = Query(None, description="Filter by severity."),
    status: IncidentStatus | None = Query(None, description="Filter by status."),
    category: IncidentType | None = Query(None, description="Filter by disaster type."),
    city: str | None = Query(None, description="Filter by city name (partial match)."),
    reporter_id: str | None = Query(None, description="Filter by reporter user ID."),
    date_from: datetime | None = Query(None, description="Reported on or after (ISO 8601)."),
    date_to: datetime | None = Query(None, description="Reported on or before (ISO 8601)."),
    search: str | None = Query(None, description="Search in title and description."),
) -> IncidentListQuery:
    """FastAPI dependency that parses incident list query parameters."""
    return IncidentListQuery(
        page=page,
        page_size=page_size,
        severity=severity,
        status=status,
        category=category,
        city=city,
        reporter_id=reporter_id,
        date_from=date_from,
        date_to=date_to,
        search=search,
    )
