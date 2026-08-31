from fastapi import APIRouter, Depends
from backend.app.schemas.system import DashboardStatsResponse
from backend.app.schemas.common import APIResponse
from backend.app.schemas.auth import UserProfile
from backend.app.services.system_service import SystemService
from backend.app.api.deps import get_system_service
from backend.app.security.auth import get_current_user

router = APIRouter()


@router.get(
    "/dashboard",
    response_model=APIResponse[DashboardStatsResponse],
    summary="Get CAD executive operational dashboard statistics",
    description="Returns high-level operational counts, active cluster density, fleet utilization, and response time metrics.",
)
async def get_admin_dashboard(
    current_user: UserProfile = Depends(get_current_user),
    system_service: SystemService = Depends(get_system_service),
) -> APIResponse[DashboardStatsResponse]:
    stats = await system_service.get_dashboard_stats()
    return APIResponse(
        success=True,
        message="CAD operational dashboard statistics retrieved successfully.",
        data=stats,
    )
