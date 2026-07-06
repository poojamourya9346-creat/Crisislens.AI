"""Schemas for AI incident analysis and reporting endpoints."""

from pydantic import Field

from crisislens.schemas.base import BaseSchema


class AIAnalysisRequest(BaseSchema):
    """Input schema for AI-driven incident analysis."""

    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=4000)
    category: str = Field(min_length=1, max_length=64)
    location: str = Field(min_length=1, max_length=255)
    weather_context: str | None = Field(default=None, max_length=1000)


class IncidentAnalysisResult(BaseSchema):
    """Structured analysis returned by the incident analyzer."""

    incident_type: str
    severity: str
    short_summary: str
    possible_risks: list[str]
    priority: str
    recommended_immediate_actions: list[str]


class AIAnalysisResponse(BaseSchema):
    """Full AI analysis payload with scoring and recommendations."""

    incident_type: str
    severity: str
    short_summary: str
    possible_risks: list[str]
    priority: str
    recommended_immediate_actions: list[str]
    risk_score: int
    citizen_instructions: list[str]
    volunteer_instructions: list[str]
    government_recommendations: list[str]
    report_markdown: str


class AIReportResponse(BaseSchema):
    """Structured government report payload."""

    incident_summary: str
    risk_score: int
    ai_reasoning: str
    recommended_actions: list[str]
    required_resources: list[str]
    report_markdown: str


class MultiAgentOrchestrationResponse(BaseSchema):
    """Aggregated response from the multi-agent crisis orchestrator."""

    incident_type: str
    severity: str
    short_summary: str
    possible_risks: list[str]
    priority: str
    recommended_immediate_actions: list[str]
    risk_score: int
    citizen_instructions: list[str]
    volunteer_instructions: list[str]
    government_recommendations: list[str]
    resource_recommendations: list[str]
    action_plan: list[str]
    report_markdown: str
    agent_results: list[dict[str, object]]
