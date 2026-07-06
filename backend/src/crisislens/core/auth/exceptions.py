"""Authentication-specific exceptions."""

from crisislens.core.constants.app_constants import ERROR_CODE_UNAUTHORIZED
from crisislens.core.exceptions.base import UnauthorizedException


class AuthenticationException(UnauthorizedException):
    """Raised when authentication credentials are invalid."""

    message = "Invalid authentication credentials."


class InvalidTokenException(UnauthorizedException):
    """Raised when a JWT is malformed or invalid."""

    error_code = "INVALID_TOKEN"
    message = "Invalid or malformed token."


class TokenExpiredException(UnauthorizedException):
    """Raised when a JWT has expired."""

    error_code = "TOKEN_EXPIRED"
    message = "Token has expired."


class InactiveUserException(UnauthorizedException):
    """Raised when an inactive user attempts to authenticate."""

    error_code = ERROR_CODE_UNAUTHORIZED
    message = "User account is inactive."


class RefreshTokenRevokedException(UnauthorizedException):
    """Raised when a refresh token has been revoked."""

    error_code = "REFRESH_TOKEN_REVOKED"
    message = "Refresh token has been revoked."
