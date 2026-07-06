"""Route permission decorators for role and permission enforcement."""

from collections.abc import Callable
from functools import wraps
from typing import Any, TypeVar

from crisislens.core.auth.dependencies import (
    require_minimum_role,
    require_permission,
    require_roles,
)
from crisislens.core.auth.roles import ApplicationRole

F = TypeVar("F", bound=Callable[..., Any])


def roles_required(*roles: ApplicationRole) -> Callable[[F], F]:
    """Decorator attaching a role-based FastAPI dependency to a route handler.

    Usage:
        @router.get("/admin", dependencies=[Depends(roles_required(ApplicationRole.SUPER_ADMIN))])
    """
    dependency = require_roles(*roles)
    return dependency  # type: ignore[return-value]


def minimum_role_required(minimum_role: ApplicationRole) -> Callable[[F], F]:
    """Decorator factory for minimum role hierarchy enforcement."""
    return require_minimum_role(minimum_role)  # type: ignore[return-value]


def permission_required(permission: str) -> Callable[[F], F]:
    """Decorator factory for named permission enforcement."""
    return require_permission(permission)  # type: ignore[return-value]


def audit_protected(func: F) -> F:
    """Mark a route handler as requiring authentication audit logging (future hook)."""

    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        return await func(*args, **kwargs)

    setattr(wrapper, "_audit_protected", True)
    return wrapper  # type: ignore[return-value]
