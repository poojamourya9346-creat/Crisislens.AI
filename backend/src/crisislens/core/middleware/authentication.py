"""Authentication middleware for request context enrichment."""

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from crisislens.core.auth.constants import TOKEN_TYPE_ACCESS
from crisislens.core.auth.jwt_manager import JWTManager


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Extract JWT claims and attach user context to request state.

    Does not block unauthenticated requests — route dependencies enforce auth.
    """

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            try:
                jwt_manager = JWTManager()
                payload = jwt_manager.decode_token(token, expected_type=TOKEN_TYPE_ACCESS)
                request.state.user_id = payload.get("sub")
                request.state.user_role = payload.get("role")
                request.state.token_jti = payload.get("jti")
            except Exception:
                request.state.user_id = None
                request.state.user_role = None
                request.state.token_jti = None

        return await call_next(request)
