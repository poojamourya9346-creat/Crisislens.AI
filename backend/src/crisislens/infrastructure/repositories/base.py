"""SQLAlchemy repository base implementation."""

from typing import Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from crisislens.infrastructure.database.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class SQLAlchemyRepository(Generic[ModelT]):
    """Generic async SQLAlchemy repository with common CRUD operations."""

    def __init__(self, session: AsyncSession, model: type[ModelT]) -> None:
        self._session = session
        self._model = model

    async def get_by_id(self, entity_id: str) -> ModelT | None:
        """Retrieve an entity by primary key."""
        return await self._session.get(self._model, entity_id)

    async def list(self, *, offset: int = 0, limit: int = 20) -> list[ModelT]:
        """List entities with offset/limit pagination."""
        stmt = select(self._model).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def count(self) -> int:
        """Return total row count for the model."""
        stmt = select(func.count()).select_from(self._model)
        result = await self._session.execute(stmt)
        return int(result.scalar_one())

    async def add(self, entity: ModelT) -> ModelT:
        """Add and flush a new entity."""
        self._session.add(entity)
        await self._session.flush()
        await self._session.refresh(entity)
        return entity

    async def update(self, entity: ModelT) -> ModelT:
        """Flush changes for an existing entity."""
        await self._session.flush()
        await self._session.refresh(entity)
        return entity

    async def delete(self, entity_id: str) -> bool:
        """Delete an entity by primary key."""
        entity = await self.get_by_id(entity_id)
        if entity is None:
            return False
        await self._session.delete(entity)
        await self._session.flush()
        return True
