"""Authentication API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from crisislens.api.deps import DbSessionDep
from crisislens.application.services.auth_service import AuthService
from crisislens.core.auth.dependencies import CurrentUserDep, bearer_scheme, get_jwt_manager
from crisislens.core.auth.jwt_manager import JWTManager
from crisislens.schemas.auth import (
    AuthUserResponse,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from crisislens.schemas.common.response import SuccessResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_auth_service(
    session: DbSessionDep,
    jwt_manager: Annotated[JWTManager, Depends(get_jwt_manager)],
) -> AuthService:
    """Provide an AuthService instance for the request."""
    return AuthService(session=session, jwt_manager=jwt_manager)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post(
    "/register",
    response_model=SuccessResponse[AuthUserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    payload: RegisterRequest,
    auth_service: AuthServiceDep,
) -> SuccessResponse[AuthUserResponse]:
    """Create a new citizen or volunteer account."""
    user = await auth_service.register(payload)
    return SuccessResponse(data=user)


@router.post(
    "/login",
    response_model=SuccessResponse[TokenResponse],
    summary="Login with email and password (JSON)",
)
async def login(
    payload: LoginRequest,
    request: Request,
    auth_service: AuthServiceDep,
) -> SuccessResponse[TokenResponse]:
    """Authenticate and receive access and refresh tokens."""
    tokens = await auth_service.login(
        payload,
        user_agent=request.headers.get("User-Agent"),
        ip_address=request.client.host if request.client else None,
    )
    return SuccessResponse(data=tokens)


@router.post(
    "/login/form",
    response_model=SuccessResponse[TokenResponse],
    summary="Login with OAuth2 form (Swagger-compatible)",
    include_in_schema=True,
)
async def login_form(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth_service: AuthServiceDep,
) -> SuccessResponse[TokenResponse]:
    """Authenticate using OAuth2 password form for Swagger UI testing."""
    tokens = await auth_service.login(
        LoginRequest(email=form_data.username, password=form_data.password),
        user_agent=request.headers.get("User-Agent"),
        ip_address=request.client.host if request.client else None,
    )
    return SuccessResponse(data=tokens)


@router.post(
    "/refresh",
    response_model=SuccessResponse[TokenResponse],
    summary="Refresh access token",
)
async def refresh_token(
    payload: RefreshTokenRequest,
    auth_service: AuthServiceDep,
) -> SuccessResponse[TokenResponse]:
    """Exchange a valid refresh token for a new token pair."""
    tokens = await auth_service.refresh(payload)
    return SuccessResponse(data=tokens)


@router.post(
    "/logout",
    response_model=SuccessResponse[dict[str, str]],
    summary="Logout and revoke refresh token",
)
async def logout(
    payload: LogoutRequest,
    auth_service: AuthServiceDep,
) -> SuccessResponse[dict[str, str]]:
    """Revoke the provided refresh token."""
    await auth_service.logout(payload)
    return SuccessResponse(data={"message": "Successfully logged out."})


@router.get(
    "/me",
    response_model=SuccessResponse[AuthUserResponse],
    summary="Get current authenticated user",
    dependencies=[Depends(bearer_scheme)],
    openapi_extra={"security": [{"BearerAuth": []}]},
)
async def get_me(
    current_user: CurrentUserDep,
    auth_service: AuthServiceDep,
) -> SuccessResponse[AuthUserResponse]:
    """Return the profile of the currently authenticated user."""
    profile = await auth_service.get_current_user_profile(current_user)
    return SuccessResponse(data=profile)
