from typing import List, Optional
from backend.app.db.base_repository import IResourceRepository
from backend.app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse
from backend.app.models.enums import ResourceStatus
from backend.app.utils.error_handlers import NotFoundException
from backend.app.utils.logger import logger


class ResourceService:
    def __init__(self, resource_repo: IResourceRepository):
        self.resource_repo = resource_repo

    async def list_resources(
        self,
        status: Optional[ResourceStatus] = None,
        type_filter: Optional[str] = None,
    ) -> List[ResourceResponse]:
        return await self.resource_repo.list_all(status=status, type_filter=type_filter)

    async def get_resource_by_id(self, resource_id: str) -> ResourceResponse:
        res = await self.resource_repo.get_by_id(resource_id)
        if not res:
            raise NotFoundException(f"Resource unit '{resource_id}' not found in tactical registry.")
        return res

    async def create_resource(self, resource_in: ResourceCreate) -> ResourceResponse:
        logger.info(f"Registering tactical resource: {resource_in.name} ({resource_in.callsign})")
        return await self.resource_repo.create(resource_in)

    async def update_resource(self, resource_id: str, update_in: ResourceUpdate) -> ResourceResponse:
        logger.info(f"Updating tactical resource: {resource_id}")
        updated = await self.resource_repo.update(resource_id, update_in)
        if not updated:
            raise NotFoundException(f"Resource unit '{resource_id}' could not be found to update.")
        return updated
