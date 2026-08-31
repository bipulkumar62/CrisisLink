from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, status
from backend.app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse
from backend.app.schemas.common import APIResponse
from backend.app.schemas.auth import UserProfile
from backend.app.models.enums import ResourceStatus
from backend.app.services.resource_service import ResourceService
from backend.app.api.deps import get_resource_service
from backend.app.security.auth import get_current_user

router = APIRouter()


@router.get(
    "/resources",
    response_model=APIResponse[List[ResourceResponse]],
    summary="List tactical emergency response fleet and shelters",
    description="Retrieves operational assets including ambulances, rescue boats, fire tenders, drones, and relief shelters with real-time location and status.",
)
async def list_resources(
    status: Optional[ResourceStatus] = Query(None, description="Filter by resource availability status"),
    type: Optional[str] = Query(None, description="Filter by resource type"),
    current_user: UserProfile = Depends(get_current_user),
    resource_service: ResourceService = Depends(get_resource_service),
) -> APIResponse[List[ResourceResponse]]:
    resources = await resource_service.list_resources(status=status, type_filter=type)
    return APIResponse(
        success=True,
        message=f"Retrieved {len(resources)} emergency tactical resources.",
        data=resources,
    )


@router.post(
    "/resources",
    response_model=APIResponse[ResourceResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new emergency response unit or shelter",
    description="Adds a new tactical resource to the CAD dispatch registry.",
)
async def create_resource(
    resource_in: ResourceCreate,
    current_user: UserProfile = Depends(get_current_user),
    resource_service: ResourceService = Depends(get_resource_service),
) -> APIResponse[ResourceResponse]:
    created = await resource_service.create_resource(resource_in)
    return APIResponse(
        success=True,
        message=f"Tactical resource '{created.callsign}' registered successfully.",
        data=created,
    )


@router.patch(
    "/resources/{id}",
    response_model=APIResponse[ResourceResponse],
    summary="Update resource status, coordinates, or capacity",
    description="Updates operational metrics for a response unit (e.g. marking AVAILABLE, updating fuel level, or recording shelter occupancy).",
)
async def update_resource(
    id: str = Path(..., description="Resource ID"),
    update_in: ResourceUpdate = ...,
    current_user: UserProfile = Depends(get_current_user),
    resource_service: ResourceService = Depends(get_resource_service),
) -> APIResponse[ResourceResponse]:
    updated = await resource_service.update_resource(id, update_in)
    return APIResponse(
        success=True,
        message=f"Resource '{updated.callsign}' updated successfully.",
        data=updated,
    )
