"""Weather, hospital, and shelter Pydantic schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import Field

from crisislens.schemas.base import BaseSchema, UUIDSchema


class WeatherSnapshotBase(BaseSchema):
    """Shared weather snapshot fields."""

    temperature_celsius: float | None = None
    humidity_percent: float | None = Field(default=None, ge=0, le=100)
    wind_speed_kmh: float | None = Field(default=None, ge=0)
    precipitation_mm: float | None = Field(default=None, ge=0)
    conditions: str | None = Field(default=None, max_length=128)
    source: str = Field(default="manual", max_length=64)
    captured_at: datetime
    raw_data: dict | None = None


class WeatherSnapshotCreate(WeatherSnapshotBase):
    """Schema for creating a weather snapshot."""

    location_id: str
    incident_id: str | None = None


class WeatherSnapshotRead(UUIDSchema, WeatherSnapshotBase):
    """Schema for reading a weather snapshot."""

    location_id: str
    incident_id: str | None = None


class HospitalBase(BaseSchema):
    """Shared hospital fields."""

    name: str = Field(min_length=1, max_length=255)
    capacity_beds: int = Field(ge=1)
    available_beds: int = Field(ge=0)
    emergency_capacity: int | None = Field(default=None, ge=0)
    contact_phone: str | None = Field(default=None, max_length=32)
    contact_email: str | None = Field(default=None, max_length=320)
    is_operational: bool = True
    specialties: list[str] | None = None


class HospitalCreate(HospitalBase):
    """Schema for creating a hospital."""

    location_id: str


class HospitalUpdate(BaseSchema):
    """Schema for partial hospital updates."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    capacity_beds: int | None = Field(default=None, ge=1)
    available_beds: int | None = Field(default=None, ge=0)
    emergency_capacity: int | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    is_operational: bool | None = None
    specialties: list[str] | None = None
    location_id: str | None = None


class HospitalRead(UUIDSchema, HospitalBase):
    """Schema for reading a hospital."""

    location_id: str


class ShelterBase(BaseSchema):
    """Shared shelter fields."""

    name: str = Field(min_length=1, max_length=255)
    capacity: int = Field(ge=1)
    current_occupancy: int = Field(default=0, ge=0)
    contact_phone: str | None = Field(default=None, max_length=32)
    is_open: bool = True
    accepts_pets: bool = False
    amenities: list[str] | None = None


class ShelterCreate(ShelterBase):
    """Schema for creating a shelter."""

    location_id: str


class ShelterUpdate(BaseSchema):
    """Schema for partial shelter updates."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    capacity: int | None = Field(default=None, ge=1)
    current_occupancy: int | None = Field(default=None, ge=0)
    contact_phone: str | None = None
    is_open: bool | None = None
    accepts_pets: bool | None = None
    amenities: list[str] | None = None
    location_id: str | None = None


class ShelterRead(UUIDSchema, ShelterBase):
    """Schema for reading a shelter."""

    location_id: str
