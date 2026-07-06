"""API v1 router aggregation."""

from fastapi import APIRouter

from crisislens.api.v1.endpoints import ai, auth

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router)
api_v1_router.include_router(ai.router)
