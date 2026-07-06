"""AI decision engine API endpoints."""

from fastapi import APIRouter, status

from crisislens.application.services.ai_service import AIWorkflowService
from crisislens.application.services.orchestrator import (
    ActionPlanAgent,
    IncidentClassificationAgent,
    MultiAgentCrisisOrchestrator,
    ReportGenerationAgent,
    ResourceRecommendationAgent,
    RiskAssessmentAgent,
)
from crisislens.schemas.ai import (
    AIAnalysisRequest,
    AIAnalysisResponse,
    AIReportResponse,
    MultiAgentOrchestrationResponse,
)
from crisislens.schemas.common.response import SuccessResponse

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post(
    "/analyze",
    response_model=SuccessResponse[AIAnalysisResponse],
    status_code=status.HTTP_200_OK,
    summary="Analyze an incident with AI",
)
async def analyze_incident(payload: AIAnalysisRequest) -> SuccessResponse[AIAnalysisResponse]:
    """Run the incident analysis pipeline and return structured intelligence."""
    service = AIWorkflowService()
    result = await service.analyze_incident(payload)
    return SuccessResponse(data=result)


@router.post(
    "/report",
    response_model=SuccessResponse[AIReportResponse],
    status_code=status.HTTP_200_OK,
    summary="Generate a government report for an incident",
)
async def generate_report(payload: AIAnalysisRequest) -> SuccessResponse[AIReportResponse]:
    """Create a structured government markdown report from the same AI pipeline."""
    service = AIWorkflowService()
    result = await service.generate_report(payload)
    return SuccessResponse(data=result)


@router.post(
    "/orchestrate",
    response_model=SuccessResponse[MultiAgentOrchestrationResponse],
    status_code=status.HTTP_200_OK,
    summary="Run the multi-agent crisis orchestration pipeline",
)
async def orchestrate(payload: AIAnalysisRequest) -> SuccessResponse[MultiAgentOrchestrationResponse]:
    """Coordinate specialized AI agents for classification, risk, resources, action planning, and reporting."""
    orchestrator = MultiAgentCrisisOrchestrator(
        agents=[
            IncidentClassificationAgent(),
            RiskAssessmentAgent(),
            ResourceRecommendationAgent(),
            ActionPlanAgent(),
            ReportGenerationAgent(),
        ]
    )
    result = await orchestrator.orchestrate(payload)
    return SuccessResponse(data=result)
