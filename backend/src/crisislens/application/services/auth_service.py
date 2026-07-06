"""Authentication application service."""

from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

UTC = timezone.utc

from crisislens.core.auth.config import AuthConfig, get_auth_config
from crisislens.core.auth.constants import SELF_REGISTRATION_ROLES, TOKEN_TYPE_REFRESH
from crisislens.core.auth.exceptions import (
    AuthenticationException,
    InactiveUserException,
    RefreshTokenRevokedException,
)
from crisislens.core.auth.jwt_manager import JWTManager
from crisislens.core.auth.roles import ApplicationRole, from_db_role, to_db_role
from crisislens.core.auth.security import (
    generate_token_id,
    hash_password,
    hash_token,
    validate_password_strength,
    verify_password,
)
from crisislens.core.exceptions.base import ConflictException, ForbiddenException, ValidationException
from crisislens.infrastructure.repositories.implementations import UserRepository
from crisislens.infrastructure.repositories.refresh_token_repository import RefreshTokenRepository
from crisislens.models.refresh_token import RefreshToken
from crisislens.models.user import User
from crisislens.schemas.auth import (
    AuthUserResponse,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)


class AuthService:
    """Orchestrates authentication use cases."""

    def __init__(
        self,
        session: AsyncSession,
        jwt_manager: JWTManager | None = None,
        auth_config: AuthConfig | None = None,
    ) -> None:
        self._session = session
        self._jwt_manager = jwt_manager or JWTManager()
        self._auth_config = auth_config or get_auth_config()
        self._user_repo = UserRepository(session)
        self._refresh_repo = RefreshTokenRepository(session)

    async def register(self, data: RegisterRequest) -> AuthUserResponse:
        """Register a new user with a self-service role."""
        if data.role.value not in SELF_REGISTRATION_ROLES:
            raise ForbiddenException(
                message="Registration is only allowed for citizen and volunteer roles.",
                details={"allowed_roles": sorted(SELF_REGISTRATION_ROLES)},
            )

        validate_password_strength(data.password)

        existing = await self._user_repo.get_by_email(data.email.lower())
        if existing is not None:
            raise ConflictException(
                message="A user with this email already exists.",
                details={"field": "email"},
            )

        user = User(
            email=data.email.lower(),
            full_name=data.full_name.strip(),
            phone=data.phone,
            organization=data.organization,
            hashed_password=hash_password(data.password),
            role=to_db_role(data.role),
            is_active=True,
            is_verified=False,
        )
        await self._user_repo.add(user)
        await self._session.commit()
        await self._session.refresh(user)
        return self._to_auth_user_response(user)

    async def login(
        self,
        data: LoginRequest,
        *,
        user_agent: str | None = None,
        ip_address: str | None = None,
    ) -> TokenResponse:
        """Authenticate a user and issue token pair."""
        user = await self._user_repo.get_by_email(data.email.lower())
        if user is None or not verify_password(data.password, user.hashed_password):
            raise AuthenticationException(message="Invalid email or password.")

        if not user.is_active:
            raise InactiveUserException()

        user.last_login_at = datetime.now(UTC)
        await self._user_repo.update(user)

        tokens = await self._issue_token_pair(
            user,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        await self._session.commit()
        return tokens

    async def refresh(self, data: RefreshTokenRequest) -> TokenResponse:
        """Rotate tokens using a valid refresh token."""
        payload = self._jwt_manager.decode_token(
            data.refresh_token,
            expected_type=TOKEN_TYPE_REFRESH,
        )
        token_jti = payload.get("jti")
        user_id = payload.get("sub")
        if not token_jti or not user_id:
            raise AuthenticationException()

        stored = await self._refresh_repo.get_by_token_hash(hash_token(data.refresh_token))
        if stored is None or stored.revoked_at is not None:
            raise RefreshTokenRevokedException()
        if stored.expires_at < datetime.now(UTC):
            raise AuthenticationException(message="Refresh token has expired.")

        user = await self._user_repo.get_by_id(user_id)
        if user is None:
            raise AuthenticationException(message="User not found.")
        if not user.is_active:
            raise InactiveUserException()

        await self._refresh_repo.revoke_by_token_hash(
            hash_token(data.refresh_token),
            datetime.now(UTC),
        )

        tokens = await self._issue_token_pair(user)
        await self._session.commit()
        return tokens

    async def logout(self, data: LogoutRequest) -> None:
        """Revoke a refresh token."""
        payload = self._jwt_manager.decode_token(
            data.refresh_token,
            expected_type=TOKEN_TYPE_REFRESH,
        )
        token_hash = hash_token(data.refresh_token)
        stored = await self._refresh_repo.get_by_token_hash(token_hash)
        if stored is None:
            raise ValidationException(message="Invalid refresh token.")

        await self._refresh_repo.revoke_by_token_hash(token_hash, datetime.now(UTC))
        await self._session.commit()

    async def get_current_user_profile(self, user: User) -> AuthUserResponse:
        """Return the authenticated user's profile."""
        return self._to_auth_user_response(user)

    async def _issue_token_pair(
        self,
        user: User,
        *,
        user_agent: str | None = None,
        ip_address: str | None = None,
    ) -> TokenResponse:
        """Create access and refresh tokens and persist refresh metadata."""
        app_role = from_db_role(user.role)
        token_jti = generate_token_id()

        access_token = self._jwt_manager.create_access_token(
            subject=user.id,
            email=user.email,
            role=app_role,
            token_id=token_jti,
        )
        refresh_token = self._jwt_manager.create_refresh_token(
            subject=user.id,
            token_id=token_jti,
        )

        expires_at = datetime.now(UTC) + timedelta(days=self._auth_config.refresh_token_expire_days)

        refresh_record = RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_token),
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        await self._refresh_repo.add(refresh_record)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=self._auth_config.access_token_expire_minutes * 60,
        )

    @staticmethod
    def _to_auth_user_response(user: User) -> AuthUserResponse:
        return AuthUserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=from_db_role(user.role),
            organization=user.organization,
            is_active=user.is_active,
            is_verified=user.is_verified,
            last_login_at=user.last_login_at,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
