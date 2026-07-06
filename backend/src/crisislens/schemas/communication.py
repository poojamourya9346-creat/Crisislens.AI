"""Notification, conversation, message, and audit log Pydantic schemas."""

from datetime import datetime

from pydantic import Field

from crisislens.models.enums import AuditAction, MessageType, NotificationChannel
from crisislens.schemas.base import BaseSchema, UUIDSchema


class NotificationBase(BaseSchema):
    """Shared notification fields."""

    title: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)
    channel: NotificationChannel
    priority: str = Field(default="normal", max_length=32)
    is_read: bool = False
    read_at: datetime | None = None
    sent_at: datetime | None = None
    metadata: dict | None = Field(default=None, validation_alias="metadata_")


class NotificationCreate(NotificationBase):
    """Schema for creating a notification."""

    user_id: str
    incident_id: str | None = None


class NotificationUpdate(BaseSchema):
    """Schema for partial notification updates."""

    is_read: bool | None = None
    read_at: datetime | None = None
    sent_at: datetime | None = None


class NotificationRead(UUIDSchema, NotificationBase):
    """Schema for reading a notification."""

    user_id: str
    incident_id: str | None = None


class ConversationBase(BaseSchema):
    """Shared conversation fields."""

    title: str | None = Field(default=None, max_length=255)
    is_active: bool = True


class ConversationCreate(ConversationBase):
    """Schema for creating a conversation."""

    created_by_id: str
    incident_id: str | None = None


class ConversationRead(UUIDSchema, ConversationBase):
    """Schema for reading a conversation."""

    incident_id: str | None = None
    created_by_id: str


class MessageBase(BaseSchema):
    """Shared message fields."""

    content: str = Field(min_length=1)
    message_type: MessageType = MessageType.TEXT
    metadata: dict | None = Field(default=None, validation_alias="metadata_")
    sent_at: datetime


class MessageCreate(MessageBase):
    """Schema for creating a message."""

    conversation_id: str
    sender_id: str | None = None


class MessageRead(UUIDSchema, MessageBase):
    """Schema for reading a message."""

    conversation_id: str
    sender_id: str | None = None


class AuditLogBase(BaseSchema):
    """Shared audit log fields."""

    action: AuditAction
    entity_type: str = Field(min_length=1, max_length=64)
    entity_id: str
    description: str | None = None
    changes: dict | None = None
    ip_address: str | None = Field(default=None, max_length=45)
    user_agent: str | None = Field(default=None, max_length=512)
    request_id: str | None = Field(default=None, max_length=64)


class AuditLogCreate(AuditLogBase):
    """Schema for creating an audit log entry."""

    user_id: str | None = None


class AuditLogRead(UUIDSchema, AuditLogBase):
    """Schema for reading an audit log entry."""

    user_id: str | None = None
