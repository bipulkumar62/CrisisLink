from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path
from backend.app.schemas.incident import (
    IncidentAdminResponse,
    IncidentStatusUpdate,
    IncidentAssignResource,
)
from backend.app.schemas.common import APIResponse
from backend.app.schemas.auth import UserProfile
from backend.app.models.enums import IncidentCategory, IncidentSeverity, IncidentStatus
from backend.app.services.incident_service import IncidentService
from backend.app.api.deps import get_incident_service
from backend.app.security.auth import get_current_user

router = APIRouter()


@router.get(
    "/incidents",
    response_model=APIResponse[List[IncidentAdminResponse]],
    summary="List operational incidents for CAD dispatchers",
    description="Retrieves incident dossiers sorted by AI priority score, including corroborated reports, audit logs, and resource assignments.",
)
async def list_admin_incidents(
    category: Optional[IncidentCategory] = Query(None, description="Filter by disaster category"),
    severity: Optional[IncidentSeverity] = Query(None, description="Filter by severity"),
    status: Optional[IncidentStatus] = Query(None, description="Filter by CAD lifecycle status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: UserProfile = Depends(get_current_user),
    incident_service: IncidentService = Depends(get_incident_service),
) -> APIResponse[List[IncidentAdminResponse]]:
    incidents = await incident_service.list_admin_incidents(
        category=category,
        severity=severity,
        status=status,
        limit=limit,
        offset=offset,
    )
    return APIResponse(
        success=True,
        message=f"Retrieved {len(incidents)} operational CAD incidents.",
        data=incidents,
    )


@router.get(
    "/incidents/{id}",
    response_model=APIResponse[IncidentAdminResponse],
    summary="Get full CAD incident dossier by ID or code",
    description="Fetches full operational intelligence including multi-signal AI observation summaries and action history logs.",
)
async def get_admin_incident_detail(
    id: str = Path(..., description="Incident ID or CAD reference code"),
    current_user: UserProfile = Depends(get_current_user),
    incident_service: IncidentService = Depends(get_incident_service),
) -> APIResponse[IncidentAdminResponse]:
    incident = await incident_service.get_admin_incident_by_id(id)
    return APIResponse(
        success=True,
        message="Incident operational dossier retrieved successfully.",
        data=incident,
    )


@router.patch(
    "/incidents/{id}/status",
    response_model=APIResponse[IncidentAdminResponse],
    summary="Update CAD incident lifecycle status",
    description="Transitions incident status (e.g. REPORTED -> TRIAGED -> VERIFIED -> DISPATCHED -> CONTAINED -> RESOLVED) and creates an audit log entry.",
)
async def update_incident_status(
    id: str = Path(..., description="Incident ID or CAD reference code"),
    update_in: IncidentStatusUpdate = ...,
    current_user: UserProfile = Depends(get_current_user),
    incident_service: IncidentService = Depends(get_incident_service),
) -> APIResponse[IncidentAdminResponse]:
    if not update_in.operator_name:
        update_in.operator_name = f"{current_user.full_name} ({current_user.badge_number})"
    updated = await incident_service.update_incident_status(id, update_in)
    return APIResponse(
        success=True,
        message=f"Incident status successfully transitioned to '{updated.status.value}'.",
        data=updated,
    )


@router.post(
    "/incidents/{id}/assign",
    response_model=APIResponse[IncidentAdminResponse],
    summary="Assign and dispatch tactical resources to incident",
    description="Allocates ambulances, rescue boats, fire tenders, or shelters to the targeted incident and updates resource status to ASSIGNED.",
)
async def assign_resources_to_incident(
    id: str = Path(..., description="Incident ID or CAD reference code"),
    assign_in: IncidentAssignResource = ...,
    current_user: UserProfile = Depends(get_current_user),
    incident_service: IncidentService = Depends(get_incident_service),
) -> APIResponse[IncidentAdminResponse]:
    if not assign_in.operator_name:
        assign_in.operator_name = f"{current_user.full_name} ({current_user.badge_number})"
    updated = await incident_service.assign_resources_to_incident(id, assign_in)
    return APIResponse(
        success=True,
        message=f"Successfully dispatched {len(assign_in.resource_ids)} tactical unit(s) to incident.",
        data=updated,
    )
