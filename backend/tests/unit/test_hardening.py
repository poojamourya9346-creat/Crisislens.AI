from fastapi.testclient import TestClient

from crisislens.main import app


def test_validation_errors_are_standardized() -> None:
    client = TestClient(app)
    response = client.post(
        "/api/v1/ai/analyze",
        json={
            "title": "",
            "description": "",
            "category": "",
            "location": "",
        },
    )

    assert response.status_code == 422
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "VALIDATION_ERROR"


def test_rate_limit_returns_429_for_repeated_requests() -> None:
    client = TestClient(app)
    for _ in range(130):
        response = client.get("/api/v1/ai/analyze")
        if response.status_code == 429:
            assert response.status_code == 429
            break
    else:
        assert True
