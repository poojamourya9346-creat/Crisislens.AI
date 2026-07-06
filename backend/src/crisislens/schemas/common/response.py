"""Standard API response schemas."""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorDetail(BaseModel):
    """Structured error detail payload."""

    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Standard error response envelope."""

    success: bool = False
    error: ErrorDetail
    request_id: str | None = None


class SuccessResponse(BaseModel, Generic[T]):
    """Standard success response envelope."""

    success: bool = True
    data: T
    request_id: str | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated list response."""

    success: bool = True
    data: list[T]
    total: int
    page: int
    page_size: int
    request_id: str | None = None
