"""AI decision engine services for incident analysis and reporting."""

from __future__ import annotations

import asyncio
import json
import os
from typing import Any

import httpx

from crisislens.core.config.settings import get_settings
from crisislens.core.logging.setup import get_logger
from crisislens.schemas.ai import (
    AIAnalysisRequest,
    AIAnalysisResponse,
    AIReportResponse,
    IncidentAnalysisResult,
)

logger = get_logger(__name__)


class GeminiService:
    """Thin wrapper around Gemini REST API with retries and timeouts."""

    def __init__(self, api_key: str | None = None) -> None:
        self._settings = get_settings()
        self._api_key = api_key or self._settings.gemini_api_key
        self._timeout = 15.0
        self._max_retries = 2

    async def generate_json(self, prompt: str) -> dict[str, Any]:
        """Generate a structured JSON object from Gemini or return a local fallback."""
        if not self._api_key:
            logger.warning("gemini_api_key_missing", prompt_hint=prompt[:80])
            return {}

        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            "gemini-1.5-flash:generateContent"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"},
        }

        last_error: Exception | None = None
        for attempt in range(self._max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self._timeout) as client:
                    response = await client.post(
                        endpoint,
                        params={"key": self._api_key},
                        json=payload,
                        headers={"Content-Type": "application/json"},
                    )
                    response.raise_for_status()
                    body = response.json()
                    text = (
                        body.get("candidates", [{}])[0]
                        .get("content", {})
                        .get("parts", [{}])[0]
                        .get("text", "")
                    )
                    if not text:
                        return {}
                    return json.loads(text)
            except (httpx.TimeoutException, httpx.HTTPError, json.JSONDecodeError, KeyError) as exc:
                last_error = exc
                logger.warning(
                    "gemini_request_failed",
                    attempt=attempt + 1,
                    error=str(exc),
                )
                await asyncio.sleep(0.25 * (attempt + 1))

        if last_error is not None:
            logger.exception("gemini_request_failed_after_retries", error=str(last_error))
        return {}


class IncidentAnalyzerService:
    """Translate incident details into a structured AI analysis payload."""

    def __init__(self, gemini_service: GeminiService | None = None) -> None:
        self._gemini_service = gemini_service or GeminiService()

    async def analyze(self, payload: AIAnalysisRequest) -> IncidentAnalysisResult:
        """Call Gemini and build a structured analysis result."""
        prompt = self._build_prompt(payload)
        gemini_payload = await self._gemini_service.generate_json(prompt)
        parsed = self._normalize_payload(gemini_payload, payload)
        return IncidentAnalysisResult(**parsed)

    def _build_prompt(self, payload: AIAnalysisRequest) -> str:
        return (
            "You are a crisis analysis assistant. Return compact valid JSON only. "
            f"Analyze this incident: title={payload.title}; "
            f"description={payload.description}; category={payload.category}; "
            f"location={payload.location}; weather_context={payload.weather_context or 'none'}. "
            "Return fields: incident_type, severity, short_summary, possible_risks, "
            "priority, recommended_immediate_actions."
        )

    def _normalize_payload(
        self, gemini_payload: dict[str, Any], payload: AIAnalysisRequest
    ) -> dict[str, Any]:
        if gemini_payload:
            normalized = {
                "incident_type": str(gemini_payload.get("incident_type") or payload.category.title()),
                "severity": str(gemini_payload.get("severity") or "High"),
                "short_summary": str(
                    gemini_payload.get("short_summary")
                    or f"{payload.title} reported in {payload.location}."
                ),
                "possible_risks": list(gemini_payload.get("possible_risks") or []),
                "priority": str(gemini_payload.get("priority") or "High"),
                "recommended_immediate_actions": list(
                    gemini_payload.get("recommended_immediate_actions") or []
                ),
            }
            return normalized

        return {
            "incident_type": payload.category.title(),
            "severity": self._default_severity(payload),
            "short_summary": f"{payload.title} reported in {payload.location}.",
            "possible_risks": self._default_risks(payload.category),
            "priority": self._default_priority(payload),
            "recommended_immediate_actions": self._default_actions(payload.category),
        }

    @staticmethod
    def _default_severity(payload: AIAnalysisRequest) -> str:
        text = f"{payload.title} {payload.description}".lower()
        if any(token in text for token in ["explosion", "fire", "chemical", "fatal", "collapse"]):
            return "Critical"
        if any(token in text for token in ["injury", "evacuation", "flood", "storm"]):
            return "High"
        return "Moderate"

    @staticmethod
    def _default_risks(category: str) -> list[str]:
        category_key = category.lower()
        if category_key == "fire":
            return ["Rapid spread to nearby buildings", "Smoke inhalation risk"]
        if category_key == "medical":
            return ["Resource saturation", "Delayed ambulance access"]
        if category_key == "flood":
            return ["Road blockage", "Waterborne contamination"]
        return ["Secondary escalation", "Community disruption"]

    @staticmethod
    def _default_priority(payload: AIAnalysisRequest) -> str:
        return "High" if "fire" in payload.category.lower() or "medical" in payload.category.lower() else "Medium"

    @staticmethod
    def _default_actions(category: str) -> list[str]:
        category_key = category.lower()
        if category_key == "fire":
            return ["Activate emergency services", "Evacuate nearby residents"]
        if category_key == "medical":
            return ["Dispatch medical teams", "Secure access routes"]
        if category_key == "flood":
            return ["Move people to higher ground", "Block unsafe roads"]
        return ["Deploy response units", "Notify local authorities"]


class RiskScoringService:
    """Compute a deterministic risk score from AI severity and context."""

    def score(self, analysis: IncidentAnalysisResult, payload: AIAnalysisRequest) -> int:
        severity_score = {"low": 20, "moderate": 45, "high": 70, "critical": 90}.get(
            analysis.severity.lower(), 55
        )
        category_bonus = self._category_bonus(payload.category)
        weather_bonus = self._weather_bonus(payload.weather_context)
        return max(0, min(100, severity_score + category_bonus + weather_bonus))

    @staticmethod
    def _category_bonus(category: str) -> int:
        category_key = category.lower()
        if category_key == "fire":
            return 10
        if category_key in {"medical", "health"}:
            return 5
        if category_key in {"flood", "storm", "chemical"}:
            return 12
        if category_key in {"crime", "security"}:
            return 7
        return 4

    @staticmethod
    def _weather_bonus(weather_context: str | None) -> int:
        if not weather_context:
            return 0
        lowered = weather_context.lower()
        if any(token in lowered for token in ["storm", "flood", "heavy rain", "wind", "heat", "cold"]):
            return 8
        return 0


class RecommendationService:
    """Generate audience-specific instructions from analysis data."""

    def build_recommendations(self, analysis: IncidentAnalysisResult) -> tuple[list[str], list[str], list[str]]:
        citizen_instructions = [
            "Stay calm and follow official evacuation guidance.",
            *analysis.recommended_immediate_actions[:2],
        ]
        volunteer_instructions = [
            "Report to the staging area and confirm your role.",
            "Support affected residents while keeping safety first.",
        ]
        government_recommendations = [
            "Deploy the appropriate emergency response units.",
            "Coordinate shelter, medical support, and communications.",
        ]
        return citizen_instructions, volunteer_instructions, government_recommendations


class GovernmentReportGenerator:
    """Create a compact human-readable Markdown report."""

    def generate_report(
        self,
        analysis: IncidentAnalysisResult,
        risk_score: int,
        citizen_instructions: list[str],
        volunteer_instructions: list[str],
        government_recommendations: list[str],
    ) -> str:
        action_lines = "\n".join(f"- {action}" for action in analysis.recommended_immediate_actions)
        resources_lines = "\n".join(
            f"- {resource}"
            for resource in [
                "Emergency response team",
                "Medical support",
                "Shelter capacity",
                "Public communications",
            ]
        )
        return (
            "# Government Incident Report\n\n"
            f"## Incident Summary\n{analysis.short_summary}\n\n"
            f"## Risk Score\n{risk_score}/100\n\n"
            f"## AI Reasoning\nSeverity: {analysis.severity}. Priority: {analysis.priority}. "
            f"Possible risks: {', '.join(analysis.possible_risks) or 'Monitor escalation.'}\n\n"
            f"## Recommended Actions\n{action_lines}\n\n"
            f"## Required Resources\n{resources_lines}\n\n"
            f"## Citizen Instructions\n{'\n'.join(f'- {line}' for line in citizen_instructions)}\n\n"
            f"## Volunteer Instructions\n{'\n'.join(f'- {line}' for line in volunteer_instructions)}\n\n"
            f"## Government Recommendations\n{'\n'.join(f'- {line}' for line in government_recommendations)}"
        )


class AIWorkflowService:
    """Orchestrate the full AI pipeline for incident analysis and reporting."""

    def __init__(self) -> None:
        self._analyzer = IncidentAnalyzerService()
        self._risk_scoring = RiskScoringService()
        self._recommendations = RecommendationService()
        self._report_generator = GovernmentReportGenerator()

    async def analyze_incident(self, payload: AIAnalysisRequest) -> AIAnalysisResponse:
        """Run the complete analysis pipeline and return a JSON-ready response."""
        analysis = await self._analyzer.analyze(payload)
        risk_score = self._risk_scoring.score(analysis, payload)
        citizen_instructions, volunteer_instructions, government_recommendations = (
            self._recommendations.build_recommendations(analysis)
        )
        report_markdown = self._report_generator.generate_report(
            analysis,
            risk_score,
            citizen_instructions,
            volunteer_instructions,
            government_recommendations,
        )
        return AIAnalysisResponse(
            incident_type=analysis.incident_type,
            severity=analysis.severity,
            short_summary=analysis.short_summary,
            possible_risks=analysis.possible_risks,
            priority=analysis.priority,
            recommended_immediate_actions=analysis.recommended_immediate_actions,
            risk_score=risk_score,
            citizen_instructions=citizen_instructions,
            volunteer_instructions=volunteer_instructions,
            government_recommendations=government_recommendations,
            report_markdown=report_markdown,
        )

    async def generate_report(self, payload: AIAnalysisRequest) -> AIReportResponse:
        """Run the analysis and return a structured report payload."""
        analysis_payload = await self.analyze_incident(payload)
        return AIReportResponse(
            incident_summary=analysis_payload.short_summary,
            risk_score=analysis_payload.risk_score,
            ai_reasoning=(
                f"Severity: {analysis_payload.severity}; Priority: {analysis_payload.priority}."
            ),
            recommended_actions=analysis_payload.recommended_immediate_actions,
            required_resources=[
                "Emergency response team",
                "Medical support",
                "Shelter capacity",
                "Public communications",
            ],
            report_markdown=analysis_payload.report_markdown,
        )
