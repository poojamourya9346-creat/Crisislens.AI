"""Application roles and persistence mapping.

Maps API-facing roles to database ``UserRole`` values without modifying ORM models.
"""

import enum

from crisislens.models.enums import UserRole


class ApplicationRole(str, enum.Enum):
    """Role exposed through the authentication API."""

    CITIZEN = "citizen"
    VOLUNTEER = "volunteer"
    NGO = "ngo"
    HOSPITAL = "hospital"
    GOVERNMENT_ADMIN = "government_admin"
    SUPER_ADMIN = "super_admin"


APPLICATION_TO_DB_ROLE: dict[ApplicationRole, UserRole] = {
    ApplicationRole.CITIZEN: UserRole.CITIZEN,
    ApplicationRole.VOLUNTEER: UserRole.RESPONDER,
    ApplicationRole.NGO: UserRole.NGO,
    ApplicationRole.HOSPITAL: UserRole.HOSPITAL,
    ApplicationRole.GOVERNMENT_ADMIN: UserRole.GOVERNMENT,
    ApplicationRole.SUPER_ADMIN: UserRole.ADMIN,
}

DB_TO_APPLICATION_ROLE: dict[UserRole, ApplicationRole] = {
    UserRole.CITIZEN: ApplicationRole.CITIZEN,
    UserRole.RESPONDER: ApplicationRole.VOLUNTEER,
    UserRole.NGO: ApplicationRole.NGO,
    UserRole.HOSPITAL: ApplicationRole.HOSPITAL,
    UserRole.GOVERNMENT: ApplicationRole.GOVERNMENT_ADMIN,
    UserRole.ADMIN: ApplicationRole.SUPER_ADMIN,
}


def to_db_role(role: ApplicationRole) -> UserRole:
    """Convert an application role to its persisted database enum value."""
    return APPLICATION_TO_DB_ROLE[role]


def from_db_role(role: UserRole) -> ApplicationRole:
    """Convert a persisted database role to its application enum value."""
    return DB_TO_APPLICATION_ROLE[role]
