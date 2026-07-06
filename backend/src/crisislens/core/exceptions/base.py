"""Base exception classes for the application."""

from typing import Any

from crisislens.core.constants.app_constants import (
    ERROR_CODE_FORBIDDEN,
    ERROR_CODE_INTERNAL,
    ERROR_CODE_NOT_FOUND,
    ERROR_CODE_UNAUTHORIZED,
    ERROR_CODE_VALIDATION,
)


class AppException(Exception):
    """Base application exception with structured error metadata."""

    status_code: int = 500
    error_code: str = ERROR_CODE_INTERNAL
    message: str = "An unexpected error occurred."

    def __init__(
        self,
        message: str | None = None,
        *,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message or self.message
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(AppException):
    """Raised when request validation fails at the application layer."""

    status_code = 422
    error_code = ERROR_CODE_VALIDATION
    message = "Validation failed."


class NotFoundException(AppException):
    """Raised when a requested resource is not found."""

    status_code = 404
    error_code = ERROR_CODE_NOT_FOUND
    message = "Resource not found."


class UnauthorizedException(AppException):
    """Raised when authentication is required or invalid."""

    status_code = 401
    error_code = ERROR_CODE_UNAUTHORIZED
    message = "Authentication required."


class ForbiddenException(AppException):
    """Raised when the authenticated user lacks permission."""

    status_code = 403
    error_code = ERROR_CODE_FORBIDDEN
    message = "Access forbidden."


class ConflictException(AppException):
    """Raised when a resource conflict occurs."""

    status_code = 409
    error_code = "CONFLICT"
    message = "Resource conflict."
