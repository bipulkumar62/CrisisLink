from fastapi import APIRouter, Depends
from backend.app.schemas.system import SystemStatusResponse
from backend.app.schemas.common import APIResponse
from backend.app.schemas.auth import UserProfile
from backend.app.services.system_service import SystemService
from backend.app.api.deps import get_system_service
from backend.app.security.auth import get_current_user

router = APIRouter()


@router.get(
    "/system-status",
    response_model=APIResponse[SystemStatusResponse],
    summary="Get CAD system diagnostics and subsystem health matrix",
    description="Returns detailed telemetry on API gateway, geospatial mesh, AI fusion engine, and evidence storage subsystems.",
)
async def get_admin_system_status(
    current_user: UserProfile = Depends(get_current_user),
    system_service: SystemService = Depends(get_system_service),
) -> APIResponse[SystemStatusResponse]:
    status_report = await system_service.get_system_status()
    return APIResponse(
        success=True,
        message="System status diagnostic matrix generated.",
        data=status_report,
    )
