"""Role-based permission definitions and checks."""

from crisislens.core.auth.roles import ApplicationRole
from crisislens.models.enums import UserRole

# Numeric hierarchy — higher values inherit lower-level permissions.
ROLE_PRIORITY: dict[ApplicationRole, int] = {
    ApplicationRole.CITIZEN: 10,
    ApplicationRole.VOLUNTEER: 20,
    ApplicationRole.NGO: 30,
    ApplicationRole.HOSPITAL: 30,
    ApplicationRole.GOVERNMENT_ADMIN: 40,
    ApplicationRole.SUPER_ADMIN: 50,
}

# Named permissions mapped to minimum required role priority.
PERMISSION_REQUIREMENTS: dict[str, int] = {
    "auth:read_self": ROLE_PRIORITY[ApplicationRole.CITIZEN],
    "incidents:report": ROLE_PRIORITY[ApplicationRole.CITIZEN],
    "incidents:respond": ROLE_PRIORITY[ApplicationRole.VOLUNTEER],
    "resources:manage_org": ROLE_PRIORITY[ApplicationRole.NGO],
    "facilities:manage": ROLE_PRIORITY[ApplicationRole.HOSPITAL],
    "incidents:manage": ROLE_PRIORITY[ApplicationRole.GOVERNMENT_ADMIN],
    "users:manage": ROLE_PRIORITY[ApplicationRole.SUPER_ADMIN],
    "system:admin": ROLE_PRIORITY[ApplicationRole.SUPER_ADMIN],
}


def application_role_from_db(db_role: UserRole) -> ApplicationRole:
    """Resolve application role from database role."""
    from crisislens.core.auth.roles import from_db_role

    return from_db_role(db_role)


def has_role(user_role: UserRole, allowed_roles: tuple[ApplicationRole, ...]) -> bool:
    """Return True when the user's role is explicitly allowed."""
    app_role = application_role_from_db(user_role)
    return app_role in allowed_roles


def has_minimum_role(user_role: UserRole, minimum_role: ApplicationRole) -> bool:
    """Return True when the user meets or exceeds the minimum role level."""
    app_role = application_role_from_db(user_role)
    return ROLE_PRIORITY[app_role] >= ROLE_PRIORITY[minimum_role]


def has_permission(user_role: UserRole, permission: str) -> bool:
    """Return True when the user has the named permission."""
    required_priority = PERMISSION_REQUIREMENTS.get(permission)
    if required_priority is None:
        return False
    app_role = application_role_from_db(user_role)
    return ROLE_PRIORITY[app_role] >= required_priority
