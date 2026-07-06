"""Incident business validation rules."""

from datetime import datetime, timezone

from crisislens.core.exceptions.base import ValidationException
from crisislens.models.enums import IncidentStatus
from crisislens.schemas.incidents import IncidentCreateRequest, IncidentUpdateRequest

UTC = timezone.utc

RESOLVED_STATUSES = frozenset({IncidentStatus.RESOLVED, IncidentStatus.CLOSED})
ACTIVE_STATUSES = frozenset({IncidentStatus.REPORTED, IncidentStatus.VERIFIED, IncidentStatus.ACTIVE})


class IncidentValidator:
    """Validates incident data beyond Pydantic schema constraints."""

    @staticmethod
    def validate_create(data: IncidentCreateRequest) -> None:
        """Validate incident creation payload."""
        IncidentValidator._validate_title_description(data.title, data.description)
        IncidentValidator._validate_coordinates(data.latitude, data.longitude)
        if data.status in RESOLVED_STATUSES:
            raise ValidationException(
                message="New incidents cannot be created with a resolved or closed status.",
                details={"field": "status"},
            )

    @staticmethod
    def validate_update(
        data: IncidentUpdateRequest,
        *,
        current_status: IncidentStatus,
        resolved_at: datetime | None,
    ) -> None:
        """Validate incident update payload."""
        if data.title is not None or data.description is not None:
            title = data.title or ""
            description = data.description or ""
            if data.title is not None and data.description is not None:
                IncidentValidator._validate_title_description(title, description)
            elif data.title is not None and len(title.strip()) < 3:
                raise ValidationException(message="Title must be at least 3 characters.")
            elif data.description is not None and len(description.strip()) < 10:
                raise ValidationException(message="Description must be at least 10 characters.")

        if data.latitude is not None or data.longitude is not None:
            if data.latitude is None or data.longitude is None:
                raise ValidationException(
                    message="Both latitude and longitude must be provided together.",
                    details={"fields": ["latitude", "longitude"]},
                )
            IncidentValidator._validate_coordinates(data.latitude, data.longitude)

        new_status = data.status or current_status
        if new_status in RESOLVED_STATUSES and current_status in ACTIVE_STATUSES:
            pass  # Valid transition to resolved
        if new_status in ACTIVE_STATUSES and current_status in RESOLVED_STATUSES:
            raise ValidationException(
                message="Cannot reopen a resolved or closed incident without admin workflow.",
                details={"field": "status"},
            )

    @staticmethod
    def validate_list_filters(
        *,
        date_from: datetime | None,
        date_to: datetime | None,
    ) -> None:
        """Validate list filter date range."""
        if date_from and date_to and date_from > date_to:
            raise ValidationException(
                message="date_from must be earlier than or equal to date_to.",
                details={"fields": ["date_from", "date_to"]},
            )

    @staticmethod
    def resolved_at_for_status(status: IncidentStatus) -> datetime | None:
        """Return resolved_at timestamp when transitioning to a terminal status."""
        if status in RESOLVED_STATUSES:
            return datetime.now(UTC)
        return None

    @staticmethod
    def _validate_title_description(title: str, description: str) -> None:
        if len(title.strip()) < 3:
            raise ValidationException(message="Title must be at least 3 characters.")
        if len(description.strip()) < 10:
            raise ValidationException(message="Description must be at least 10 characters.")

    @staticmethod
    def _validate_coordinates(latitude, longitude) -> None:
        if latitude == 0 and longitude == 0:
            raise ValidationException(
                message="Coordinates (0, 0) are not allowed. Provide a valid location.",
                details={"fields": ["latitude", "longitude"]},
            )
