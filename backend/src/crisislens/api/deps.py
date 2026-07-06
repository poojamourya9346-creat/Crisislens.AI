"""Shared FastAPI dependencies (injection layer)."""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from crisislens.core.config.settings import Settings, get_settings
from crisislens.infrastructure.database.session import get_db_session

SettingsDep = Annotated[Settings, Depends(get_settings)]
DbSessionDep = Annotated[AsyncSession, Depends(get_db_session)]
