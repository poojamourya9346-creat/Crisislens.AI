import pytest
from httpx import ASGITransport, AsyncClient

from crisislens.main import app


@pytest.mark.asyncio
async def test_ai_orchestrate_endpoint_returns_multi_agent_output() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/ai/orchestrate",
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
    data = payload["data"]
    assert data["incident_type"]
    assert data["severity"]
    assert data["risk_score"] >= 0
    assert data["risk_score"] <= 100
    assert data["resource_recommendations"]
    assert data["action_plan"]
    assert data["report_markdown"]
    assert len(data["agent_results"]) == 5
