"""Pytest configuration and shared fixtures."""

import pytest
from httpx import ASGITransport, AsyncClient

from crisislens.main import app


@pytest.fixture
async def async_client() -> AsyncClient:
    """Provide an async HTTP client for integration tests."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
