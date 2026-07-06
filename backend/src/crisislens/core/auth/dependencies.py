"""FastAPI authentication dependencies and role guards."""

from collections.abc import Callable
from typing import Annotated, Any

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from crisislens.api.deps import DbSessionDep
from crisislens.core.auth.constants import TOKEN_TYPE_ACCESS
from crisislens.core.auth.exceptions import AuthenticationException, InactiveUserException
from crisislens.core.auth.jwt_manager import JWTManager, get_jwt_manager
from crisislens.core.auth.permissions import has_minimum_role, has_permission, has_role
from crisislens.core.auth.roles import ApplicationRole
from crisislens.core.exceptions.base import ForbiddenException
from crisislens.infrastructure.repositories.implementations import UserRepository
from crisislens.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    session: DbSessionDep,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    jwt_manager: Annotated[JWTManager, Depends(get_jwt_manager)],
) -> User:
    """Resolve the authenticated user from a Bearer access token."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AuthenticationException(message="Missing or invalid authorization header.")

    payload = jwt_manager.decode_token(credentials.credentials, expected_type=TOKEN_TYPE_ACCESS)
    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationException()

    user_repo = UserRepository(session)
    user = await user_repo.get_by_id(user_id)
    if user is None:
        raise AuthenticationException(message="User not found.")

    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Ensure the authenticated user account is active."""
    if not current_user.is_active:
        raise InactiveUserException()
    return current_user


CurrentUserDep = Annotated[User, Depends(get_current_active_user)]


def require_roles(*roles: ApplicationRole) -> Callable[..., Any]:
    """Dependency factory requiring one of the specified roles."""

    async def _guard(current_user: CurrentUserDep) -> User:
        if not has_role(current_user.role, roles):
            raise ForbiddenException(
                message="Insufficient role privileges.",
                details={"required_roles": [role.value for role in roles]},
            )
        return current_user

    return _guard


def require_minimum_role(minimum_role: ApplicationRole) -> Callable[..., Any]:
    """Dependency factory requiring a minimum role hierarchy level."""

    async def _guard(current_user: CurrentUserDep) -> User:
        if not has_minimum_role(current_user.role, minimum_role):
            raise ForbiddenException(
                message="Insufficient role privileges.",
                details={"minimum_role": minimum_role.value},
            )
        return current_user

    return _guard


def require_permission(permission: str) -> Callable[..., Any]:
    """Dependency factory requiring a named permission."""

    async def _guard(current_user: CurrentUserDep) -> User:
        if not has_permission(current_user.role, permission):
            raise ForbiddenException(
                message="Insufficient permissions.",
                details={"required_permission": permission},
            )
        return current_user

    return _guard
