"""Location Pydantic schemas."""

from decimal import Decimal

from pydantic import Field

from crisislens.schemas.base import BaseSchema, UUIDSchema


class LocationBase(BaseSchema):
    """Shared location fields."""

    latitude: Decimal = Field(ge=-90, le=90, max_digits=10, decimal_places=7)
    longitude: Decimal = Field(ge=-180, le=180, max_digits=10, decimal_places=7)
    address_line_1: str | None = Field(default=None, max_length=255)
    address_line_2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=128)
    state: str | None = Field(default=None, max_length=128)
    country: str = Field(default="IN", min_length=2, max_length=2)
    postal_code: str | None = Field(default=None, max_length=20)
    place_name: str | None = Field(default=None, max_length=255)
    geohash: str | None = Field(default=None, max_length=12)


class LocationCreate(LocationBase):
    """Schema for creating a location."""


class LocationUpdate(BaseSchema):
    """Schema for partial location updates."""

    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    address_line_1: str | None = None
    address_line_2: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = Field(default=None, min_length=2, max_length=2)
    postal_code: str | None = None
    place_name: str | None = None
    geohash: str | None = None


class LocationRead(UUIDSchema, LocationBase):
    """Schema for reading a location."""
