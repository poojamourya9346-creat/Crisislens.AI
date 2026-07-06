"""Global exception handlers for FastAPI."""

from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from crisislens.core.constants.app_constants import ERROR_CODE_VALIDATION
from crisislens.core.exceptions.base import AppException
from crisislens.core.logging.setup import get_logger
from crisislens.schemas.common.response import ErrorDetail, ErrorResponse

logger = get_logger(__name__)


def _build_error_response(
    *,
    status_code: int,
    error_code: str,
    message: str,
    details: dict[str, Any] | None = None,
    request_id: str | None = None,
) -> JSONResponse:
    """Build a standardized JSON error response."""
    payload = ErrorResponse(
        error=ErrorDetail(
            code=error_code,
            message=message,
            details=details or {},
        ),
        request_id=request_id,
    )
    return JSONResponse(status_code=status_code, content=payload.model_dump(mode="json"))


def register_exception_handlers(app: FastAPI) -> None:
    """Register all global exception handlers on the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        logger.warning(
            "application_exception",
            error_code=exc.error_code,
            message=exc.message,
            status_code=exc.status_code,
            request_id=request_id,
        )
        return _build_error_response(
            status_code=exc.status_code,
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
            request_id=request_id,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        details = {"errors": exc.errors()}
        logger.warning(
            "validation_exception",
            errors=exc.errors(),
            request_id=request_id,
        )
        return _build_error_response(
            status_code=422,
            error_code=ERROR_CODE_VALIDATION,
            message="Request validation failed.",
            details=details,
            request_id=request_id,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        return _build_error_response(
            status_code=exc.status_code,
            error_code=f"HTTP_{exc.status_code}",
            message=str(exc.detail),
            request_id=request_id,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        logger.exception(
            "unhandled_exception",
            error=str(exc),
            request_id=request_id,
        )
        return _build_error_response(
            status_code=500,
            error_code="INTERNAL_SERVER_ERROR",
            message="An internal server error occurred.",
            request_id=request_id,
        )
