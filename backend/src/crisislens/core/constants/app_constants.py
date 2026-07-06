"""Centralized application constants."""

APP_TITLE = "CrisisLens AI"
APP_DESCRIPTION = (
    "An Autonomous Multi-Agent Decision Intelligence Platform for Smarter Communities"
)

# API Versioning
API_V1_PREFIX = "/api/v1"

# Pagination Defaults
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Request Context
REQUEST_ID_HEADER = "X-Request-ID"

# Error Codes
ERROR_CODE_VALIDATION = "VALIDATION_ERROR"
ERROR_CODE_NOT_FOUND = "NOT_FOUND"
ERROR_CODE_UNAUTHORIZED = "UNAUTHORIZED"
ERROR_CODE_FORBIDDEN = "FORBIDDEN"
ERROR_CODE_INTERNAL = "INTERNAL_SERVER_ERROR"
