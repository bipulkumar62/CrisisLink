from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.utils.logger import logger


def setup_cors(app: FastAPI) -> None:
    """
    Configures secure CORS middleware.
    Ensures wildcard '*' is forbidden in production environments.
    """
    allowed_origins = settings.get_cors_origins()
    logger.info(f"Configuring CORS with allowed origins: {allowed_origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        max_age=600,
    )
