from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path
from backend.app.schemas.incident import IncidentPublicResponse
from backend.app.schemas.common import APIResponse
from backend.app.models.enums import IncidentCategory, IncidentSeverity, IncidentStatus
from backend.app.services.incident_service import IncidentService
from backend.app.api.deps import get_incident_service

router = APIRouter()


@router.get(
    "/incidents",
    response_model=APIResponse[List[IncidentPublicResponse]],
    summary="List active public emergency incidents",
    description="Retrieves verified active disaster incidents for community safety display, filtering by category and severity.",
)
async def list_public_incidents(
    category: Optional[IncidentCategory] = Query(None, description="Filter by disaster category"),
    severity: Optional[IncidentSeverity] = Query(None, description="Filter by severity level"),
    status: Optional[IncidentStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    incident_service: IncidentService = Depends(get_incident_service),
) -> APIResponse[List[IncidentPublicResponse]]:
    incidents = await incident_service.list_public_incidents(
        category=category,
        severity=severity,
        status=status,
        limit=limit,
        offset=offset,
    )
    return APIResponse(
        success=True,
        message=f"Retrieved {len(incidents)} active public incidents.",
        data=incidents,
    )


@router.get(
    "/incidents/{id}",
    response_model=APIResponse[IncidentPublicResponse],
    summary="Get public incident details by ID or code",
    description="Fetches public safety information, perimeter radius, and evacuation advice for a specific incident.",
)
async def get_public_incident(
    id: str = Path(..., description="Incident internal ID or CAD reference code (e.g. INC-2026-JP-001)"),
    incident_service: IncidentService = Depends(get_incident_service),
) -> APIResponse[IncidentPublicResponse]:
    incident = await incident_service.get_public_incident_by_id(id)
    return APIResponse(
        success=True,
        message="Incident details retrieved successfully.",
        data=incident,
    )
