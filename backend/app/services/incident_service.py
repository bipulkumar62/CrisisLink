from typing import List, Optional
from backend.app.db.base_repository import IIncidentRepository, IResourceRepository
from backend.app.schemas.incident import (
    IncidentPublicResponse,
    IncidentAdminResponse,
    IncidentStatusUpdate,
    IncidentAssignResource,
)
from backend.app.models.enums import IncidentCategory, IncidentSeverity, IncidentStatus, ResourceStatus
from backend.app.utils.error_handlers import NotFoundException, AppException
from backend.app.utils.logger import logger


class IncidentService:
    def __init__(self, incident_repo: IIncidentRepository, resource_repo: IResourceRepository):
        self.incident_repo = incident_repo
        self.resource_repo = resource_repo

    async def list_public_incidents(
        self,
        category: Optional[IncidentCategory] = None,
        severity: Optional[IncidentSeverity] = None,
        status: Optional[IncidentStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[IncidentPublicResponse]:
        return await self.incident_repo.list_public(
            category=category,
            severity=severity,
            status=status,
            limit=limit,
            offset=offset,
        )

    async def get_public_incident_by_id(self, incident_id_or_code: str) -> IncidentPublicResponse:
        # Check by id or code
        incident = await self.incident_repo.get_by_id(incident_id_or_code)
        if not incident:
            incident = await self.incident_repo.get_by_code(incident_id_or_code)

        if not incident or incident.status == IncidentStatus.REJECTED:
            raise NotFoundException(f"Public incident '{incident_id_or_code}' not found or no longer active.")

        return IncidentPublicResponse(
            id=incident.id,
            code=incident.code,
            title=incident.title,
            category=incident.category,
            severity=incident.severity,
            status=incident.status,
            location=incident.location,
            affected_radius_meters=incident.affected_radius_meters,
            safe_zone_guidance=incident.safe_zone_guidance,
            reported_at=incident.reported_at,
            updated_at=incident.updated_at,
            corroboration_count=incident.corroboration_count,
            is_verified=incident.is_verified,
        )

    async def list_admin_incidents(
        self,
        category: Optional[IncidentCategory] = None,
        severity: Optional[IncidentSeverity] = None,
        status: Optional[IncidentStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[IncidentAdminResponse]:
        return await self.incident_repo.list_admin(
            category=category,
            severity=severity,
            status=status,
            limit=limit,
            offset=offset,
        )

    async def get_admin_incident_by_id(self, incident_id_or_code: str) -> IncidentAdminResponse:
        incident = await self.incident_repo.get_by_id(incident_id_or_code)
        if not incident:
            incident = await self.incident_repo.get_by_code(incident_id_or_code)

        if not incident:
            raise NotFoundException(f"CAD incident '{incident_id_or_code}' not found in operational database.")

        return incident

    async def update_incident_status(
        self,
        incident_id: str,
        update_in: IncidentStatusUpdate,
    ) -> IncidentAdminResponse:
        logger.info(f"Transitioning CAD incident {incident_id} to {update_in.status.value}")
        updated = await self.incident_repo.update_status(incident_id, update_in)
        if not updated:
            raise NotFoundException(f"Incident {incident_id} could not be found to update status.")
        return updated

    async def assign_resources_to_incident(
        self,
        incident_id: str,
        assign_in: IncidentAssignResource,
    ) -> IncidentAdminResponse:
        logger.info(f"Dispatching resources {assign_in.resource_ids} to incident {incident_id}")
        
        # Verify resources exist
        for res_id in assign_in.resource_ids:
            res = await self.resource_repo.get_by_id(res_id)
            if not res:
                raise NotFoundException(f"Resource {res_id} does not exist in fleet registry.")

        updated = await self.incident_repo.assign_resources(
            incident_id=incident_id,
            resource_ids=assign_in.resource_ids,
            operator_name=assign_in.operator_name or "CAD Dispatcher",
            notes=assign_in.dispatch_notes,
        )
        if not updated:
            raise NotFoundException(f"Incident {incident_id} not found.")

        # Update resource status in resource repo
        for res_id in assign_in.resource_ids:
            from backend.app.schemas.resource import ResourceUpdate
            await self.resource_repo.update(
                res_id,
                ResourceUpdate(
                    status=ResourceStatus.ASSIGNED,
                    assigned_incident_id=incident_id,
                )
            )

        return updated
