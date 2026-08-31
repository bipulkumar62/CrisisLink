from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    public_reports,
    public_incidents,
    auth,
    admin_dashboard,
    admin_incidents,
    admin_reports,
    admin_resources,
    admin_system,
)

api_v1_router = APIRouter()

# Public citizen endpoints
api_v1_router.include_router(public_reports.router, prefix="", tags=["Public Reports"])
api_v1_router.include_router(public_incidents.router, prefix="", tags=["Public Incidents"])

# Authentication
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Admin & Dispatcher operations
api_v1_router.include_router(admin_dashboard.router, prefix="/admin", tags=["CAD Admin Dashboard"])
api_v1_router.include_router(admin_incidents.router, prefix="/admin", tags=["CAD Admin Incidents"])
api_v1_router.include_router(admin_reports.router, prefix="/admin", tags=["CAD Admin Reports"])
api_v1_router.include_router(admin_resources.router, prefix="/admin", tags=["CAD Admin Resources"])
api_v1_router.include_router(admin_system.router, prefix="/admin", tags=["CAD System Health"])
