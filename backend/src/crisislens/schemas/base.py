"""Shared Pydantic schema base classes."""

from datetime import datetime
import re

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BaseSchema(BaseModel):
    """Base schema with ORM mode and input sanitization."""

    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        populate_by_name=True,
    )

    @model_validator(mode="after")
    def _sanitize_strings(self) -> "BaseSchema":
        for name, value in self.__dict__.items():
            if isinstance(value, str):
                cleaned = re.sub(r"\s+", " ", value).strip()
                if getattr(self, name) != cleaned:
                    setattr(self, name, cleaned)
        return self


class TimestampSchema(BaseSchema):
    """Mixin schema for timestamp fields."""

    created_at: datetime
    updated_at: datetime


class UUIDSchema(TimestampSchema):
    """Mixin schema for entities with UUID primary key."""

    id: str = Field(description="Unique entity identifier")
