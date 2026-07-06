"""Application entry point and FastAPI factory."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from crisislens.api.v1.router import api_v1_router
from crisislens.core.config.settings import get_settings
from crisislens.core.constants.app_constants import API_V1_PREFIX, APP_DESCRIPTION, APP_TITLE
from crisislens.core.exceptions.handlers import register_exception_handlers
from crisislens.core.logging.setup import configure_logging, get_logger
from crisislens.core.middleware.authentication import AuthenticationMiddleware
from crisislens.core.middleware.rate_limit import RateLimitMiddleware
from crisislens.core.middleware.request_context import RequestContextMiddleware

logger = get_logger(__name__)


def _build_openapi_schema(app: FastAPI):
    """Inject Bearer security scheme into OpenAPI for Swagger testing."""
    from fastapi.openapi.utils import get_openapi

    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        schema = get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            routes=app.routes,
        )
        schema.setdefault("components", {}).setdefault("securitySchemes", {})
        schema["components"]["securitySchemes"]["BearerAuth"] = {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
        app.openapi_schema = schema
        return app.openapi_schema

    return custom_openapi


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage application startup and shutdown lifecycle."""
    settings = get_settings()
    configure_logging(log_level=settings.log_level, log_format=settings.log_format)

    logger.info(
        "application_starting",
        app_name=settings.app_name,
        environment=settings.app_env,
        debug=settings.app_debug,
    )

    yield

    logger.info("application_shutdown", app_name=settings.app_name)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    settings = get_settings()

    app = FastAPI(
        title=APP_TITLE,
        description=APP_DESCRIPTION,
        version=settings.app_version,
        docs_url=f"{API_V1_PREFIX}/docs" if settings.app_debug else None,
        redoc_url=f"{API_V1_PREFIX}/redoc" if settings.app_debug else None,
        openapi_url=f"{API_V1_PREFIX}/openapi.json" if settings.app_debug else None,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(AuthenticationMiddleware)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=120)

    register_exception_handlers(app)

    # OpenAPI Bearer auth for Swagger UI
    if settings.app_debug:
        app.openapi = _build_openapi_schema(app)

    app.include_router(api_v1_router, prefix=API_V1_PREFIX)

    return app


app = create_app()
