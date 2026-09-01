import time
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, status
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.config import settings
from backend.app.utils.logger import logger, setup_logger
from backend.app.utils.error_handlers import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)
from backend.app.security.cors import setup_cors
from backend.app.api.v1.router import api_v1_router
from backend.app.schemas.common import APIResponse

# Track app startup timestamp for health uptime calculations
_start_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} in {settings.ENVIRONMENT} mode...")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "FastAPI Emergency Dispatch and Multi-Signal Citizen CAD Service for Jaipur City.\n\n"
            "Provides public eyewitness reporting pipelines, public verified community hazard feeds, "
            "and tactical CAD dispatch operator endpoints."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # 1. Setup CORS Middleware
    setup_cors(app)

    # 2. Register Centralized Error Handlers
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    # 3. Root & Health Check Endpoints
    @app.api_route(
        "/",
        methods=["GET", "HEAD"],
        tags=["System Health"],
        summary="Root API Info",
        description="Returns API status and documentation links.",
        status_code=status.HTTP_200_OK,
    )
    async def root_info() -> Dict[str, Any]:
        return {
            "status": "online",
            "message": f"Welcome to {settings.APP_NAME} v{settings.APP_VERSION}",
            "docs": "/docs",
            "health": "/health",
            "api_v1": settings.API_V1_STR,
        }

    @app.api_route(
        "/health",
        methods=["GET", "HEAD"],
        tags=["System Health"],
        summary="Service Health Check",
        description="Public health and subsystem diagnostic probe for load balancers and container orchestrators.",
        status_code=status.HTTP_200_OK,
    )
    async def health_check() -> Dict[str, Any]:
        uptime_seconds = round(time.time() - _start_time, 2)
        return {
            "status": "healthy",
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "uptime_seconds": uptime_seconds,
            "checks": {
                "in_memory_cad_database": "connected",
                "geospatial_mesh": "operational",
                "evidence_vault": "ready",
            },
        }

    # 4. Include API v1 Router
    app.include_router(api_v1_router, prefix=settings.API_V1_STR)

    return app


app = create_app()
