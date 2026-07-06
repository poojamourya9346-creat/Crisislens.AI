"""Authentication constants."""

TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"

AUTH_HEADER_SCHEME = "Bearer"
AUTH_TOKEN_URL = "/api/v1/auth/login"

# Roles allowed during self-registration.
SELF_REGISTRATION_ROLES: frozenset[str] = frozenset({"citizen", "volunteer"})

# Minimum password length for registration.
MIN_PASSWORD_LENGTH = 8
