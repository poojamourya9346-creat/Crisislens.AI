import pytest
from httpx import ASGITransport, AsyncClient

from crisislens.main import app


@pytest.mark.asyncio
async def test_ai_analyze_endpoint_returns_structured_output() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/ai/analyze",
            json={
                "title": "Warehouse fire",
                "description": "A fire broke out in a warehouse near a residential area.",
                "category": "fire",
                "location": "Downtown",
                "weather_context": "Strong winds reported",
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["risk_score"] >= 0
    assert payload["data"]["risk_score"] <= 100
    assert payload["data"]["citizen_instructions"]
    assert payload["data"]["government_recommendations"]
