"""Simple in-memory rate limiting middleware for API endpoints."""

from __future__ import annotations

import time
from collections import defaultdict
from collections.abc import Callable
from typing import Any

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from crisislens.core.constants.app_constants import ERROR_CODE_VALIDATION
from crisislens.core.exceptions.base import ValidationException
from crisislens.core.logging.setup import get_logger
from crisislens.schemas.common.response import ErrorDetail, ErrorResponse

logger = get_logger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Limit repeated requests per client IP in a lightweight in-memory store."""

    def __init__(self, app: Any, *, requests_per_minute: int = 60) -> None:
        super().__init__(app)
        self._requests_per_minute = requests_per_minute
        self._requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window = self._requests[client_ip]
        window[:] = [timestamp for timestamp in window if now - timestamp < 60]

        if len(window) >= self._requests_per_minute:
            logger.warning("rate_limit_exceeded", client_ip=client_ip, path=request.url.path)
            payload = ErrorResponse(
                error=ErrorDetail(
                    code=ERROR_CODE_VALIDATION,
                    message="Too many requests. Please try again shortly.",
                    details={"retry_after_seconds": 60},
                )
            )
            return JSONResponse(status_code=429, content=payload.model_dump(mode="json"))

        window.append(now)
        return await call_next(request)
