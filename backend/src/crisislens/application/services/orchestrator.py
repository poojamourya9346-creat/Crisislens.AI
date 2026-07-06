"""Modular multi-agent orchestration for crisis intelligence workflows."""

from __future__ import annotations

from typing import Any

from crisislens.application.services.ai_service import (
    GovernmentReportGenerator,
    IncidentAnalyzerService,
    RecommendationService,
    RiskScoringService,
)
from crisislens.schemas.ai import (
    AIAnalysisRequest,
    IncidentAnalysisResult,
    MultiAgentOrchestrationResponse,
)


class BaseAgent:
    """Base interface for specialized crisis intelligence agents."""

    def __init__(self, name: str, description: str) -> None:
        self.name = name
        self.description = description

    async def run(
        self,
        payload: AIAnalysisRequest,
        analysis: IncidentAnalysisResult,
        context: dict[str, Any],
    ) -> dict[str, Any]:
        raise NotImplementedError


class IncidentClassificationAgent(BaseAgent):
    """Classify the incident and provide the initial triage summary."""

    def __init__(self) -> None:
        super().__init__(
            "IncidentClassificationAgent",
            "Classifies the incident and summarizes the situation.",
        )

    async def run(
        self,
        payload: AIAnalysisRequest,
        analysis: IncidentAnalysisResult,
        context: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "name": self.name,
            "status": "completed",
            "summary": "Incident classification completed.",
            "details": {
                "incident_type": analysis.incident_type,
                "severity": analysis.severity,
                "priority": analysis.priority,
                "summary": analysis.short_summary,
            },
        }


class RiskAssessmentAgent(BaseAgent):
    """Assess the severity and derive a risk score."""

    def __init__(self) -> None:
        super().__init__(
            "RiskAssessmentAgent",
            "Scores the incident and estimates escalation risk.",
        )

    async def run(
        self,
        payload: AIAnalysisRequest,
        analysis: IncidentAnalysisResult,
        context: dict[str, Any],
    ) -> dict[str, Any]:
        risk_score = context["risk_score"]
        risk_level = self._risk_level(risk_score)
        return {
            "name": self.name,
            "status": "completed",
            "summary": f"Risk score computed as {risk_score}/100.",
            "details": {
                "risk_score": risk_score,
                "risk_level": risk_level,
                "possible_risks": analysis.possible_risks,
            },
        }

    @staticmethod
    def _risk_level(score: int) -> str:
        if score >= 80:
            return "critical"
        if score >= 60:
            return "high"
        if score >= 40:
            return "moderate"
        return "low"


class ResourceRecommendationAgent(BaseAgent):
    """Recommend resources and support needed for the incident."""

    def __init__(self) -> None:
        super().__init__(
            "ResourceRecommendationAgent",
            "Recommends the operational resources needed for response.",
        )

    async def run(
        self,
        payload: AIAnalysisRequest,
        analysis: IncidentAnalysisResult,
        context: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "name": self.name,
            "status": "completed",
            "summary": "Resource recommendations assembled.",
            "details": {
                "resource_recommendations": context["resource_recommendations"],
            },
        }


class ActionPlanAgent(BaseAgent):
    """Turn the insights into a practical response plan."""

    def __init__(self) -> None:
        super().__init__(
            "ActionPlanAgent",
            "Builds a concrete action plan from the current analysis.",
        )

    async def run(
        self,
        payload: AIAnalysisRequest,
        analysis: IncidentAnalysisResult,
        context: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "name": self.name,
            "status": "completed",
            "summary": "Action plan generated.",
            "details": {
                "action_plan": context["action_plan"],
            },
        }


class ReportGenerationAgent(BaseAgent):
    """Generate a structured government-style report."""

    def __init__(self) -> None:
        super().__init__(
            "ReportGenerationAgent",
            "Synthesizes the final report from aggregated intelligence.",
        )

    async def run(
        self,
        payload: AIAnalysisRequest,
        analysis: IncidentAnalysisResult,
        context: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "name": self.name,
            "status": "completed",
            "summary": "Report generated.",
            "details": {
                "report_markdown": context["report_markdown"],
            },
        }


class MultiAgentCrisisOrchestrator:
    """Coordinate specialized agents into a single crisis intelligence workflow."""

    def __init__(self, agents: list[BaseAgent] | None = None) -> None:
        self._agents = list(agents or [])
        self._analyzer = IncidentAnalyzerService()
        self._risk_scoring = RiskScoringService()
        self._recommendations = RecommendationService()
        self._report_generator = GovernmentReportGenerator()

    def register_agent(self, agent: BaseAgent) -> None:
        """Register a new agent for future orchestration runs."""
        self._agents.append(agent)

    async def orchestrate(self, payload: AIAnalysisRequest) -> MultiAgentOrchestrationResponse:
        """Run the full multi-agent pipeline and return a cohesive response."""
        analysis = await self._analyzer.analyze(payload)
        risk_score = self._risk_scoring.score(analysis, payload)
        citizen_instructions, volunteer_instructions, government_recommendations = (
            self._recommendations.build_recommendations(analysis)
        )
        resource_recommendations = [
            "Emergency response team",
            "Medical support",
            "Shelter capacity",
            "Public communications",
        ]
        action_plan = [
            *analysis.recommended_immediate_actions,
            "Coordinate with local authorities and shelters.",
        ]
        report_markdown = self._report_generator.generate_report(
            analysis,
            risk_score,
            citizen_instructions,
            volunteer_instructions,
            government_recommendations,
        )

        context: dict[str, Any] = {
            "analysis": analysis,
            "risk_score": risk_score,
            "citizen_instructions": citizen_instructions,
            "volunteer_instructions": volunteer_instructions,
            "government_recommendations": government_recommendations,
            "resource_recommendations": resource_recommendations,
            "action_plan": action_plan,
            "report_markdown": report_markdown,
        }

        agent_results = []
        for agent in self._agents:
            agent_results.append(await agent.run(payload, analysis, context))

        return MultiAgentOrchestrationResponse(
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
            resource_recommendations=resource_recommendations,
            action_plan=action_plan,
            report_markdown=report_markdown,
            agent_results=agent_results,
        )
