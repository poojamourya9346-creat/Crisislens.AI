"""Incident list filter parameters."""

from dataclasses import dataclass
from datetime import datetime

from crisislens.models.enums import IncidentSeverity, IncidentStatus, IncidentType


@dataclass(frozen=True)
class IncidentListFilter:
    """Domain filter criteria for incident queries."""

    severity: IncidentSeverity | None = None
    status: IncidentStatus | None = None
    incident_type: IncidentType | None = None
    city: str | None = None
    reporter_id: str | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None
    search: str | None = None
