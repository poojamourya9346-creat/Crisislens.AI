"""Generic repository interface (port)."""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar

T = TypeVar("T")


class IRepository(ABC, Generic[T]):
    """Abstract repository contract for CRUD operations."""

    @abstractmethod
    async def get_by_id(self, entity_id: str) -> T | None:
        """Retrieve an entity by its primary key."""

    @abstractmethod
    async def list(self, *, offset: int = 0, limit: int = 20) -> list[T]:
        """List entities with pagination."""

    @abstractmethod
    async def count(self) -> int:
        """Return total entity count."""

    @abstractmethod
    async def add(self, entity: T) -> T:
        """Persist a new entity."""

    @abstractmethod
    async def update(self, entity: T) -> T:
        """Persist changes to an existing entity."""

    @abstractmethod
    async def delete(self, entity_id: str) -> bool:
        """Delete an entity by primary key. Returns True if deleted."""
