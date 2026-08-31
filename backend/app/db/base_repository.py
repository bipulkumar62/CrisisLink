from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from backend.app.schemas.report import CitizenReportCreate, CitizenReportResponse
from backend.app.schemas.incident import (
    IncidentPublicResponse,
    IncidentAdminResponse,
    IncidentStatusUpdate,
)
from backend.app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourceResponse,
)
from backend.app.schemas.auth import UserProfile
from backend.app.models.enums import IncidentCategory, IncidentSeverity, IncidentStatus, ResourceStatus


class IReportRepository(ABC):
    @abstractmethod
    async def create(self, report_in: CitizenReportCreate) -> CitizenReportResponse:
        pass

    @abstractmethod
    async def get_by_id(self, report_id: str) -> Optional[CitizenReportResponse]:
        pass

    @abstractmethod
    async def get_by_token(self, token: str) -> Optional[CitizenReportResponse]:
        pass

    @abstractmethod
    async def list_all(
        self,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[CitizenReportResponse]:
        pass

    @abstractmethod
    async def count(self, status: Optional[str] = None) -> int:
        pass


class IIncidentRepository(ABC):
    @abstractmethod
    async def list_public(
        self,
        category: Optional[IncidentCategory] = None,
        severity: Optional[IncidentSeverity] = None,
        status: Optional[IncidentStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[IncidentPublicResponse]:
        pass

    @abstractmethod
    async def list_admin(
        self,
        category: Optional[IncidentCategory] = None,
        severity: Optional[IncidentSeverity] = None,
        status: Optional[IncidentStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[IncidentAdminResponse]:
        pass

    @abstractmethod
    async def get_by_id(self, incident_id: str) -> Optional[IncidentAdminResponse]:
        pass

    @abstractmethod
    async def get_by_code(self, code: str) -> Optional[IncidentAdminResponse]:
        pass

    @abstractmethod
    async def update_status(
        self,
        incident_id: str,
        update_in: IncidentStatusUpdate,
    ) -> Optional[IncidentAdminResponse]:
        pass

    @abstractmethod
    async def assign_resources(
        self,
        incident_id: str,
        resource_ids: List[str],
        operator_name: str,
        notes: Optional[str] = None,
    ) -> Optional[IncidentAdminResponse]:
        pass

    @abstractmethod
    async def count_active(self) -> int:
        pass

    @abstractmethod
    async def count_critical(self) -> int:
        pass


class IResourceRepository(ABC):
    @abstractmethod
    async def list_all(
        self,
        status: Optional[ResourceStatus] = None,
        type_filter: Optional[str] = None,
    ) -> List[ResourceResponse]:
        pass

    @abstractmethod
    async def get_by_id(self, resource_id: str) -> Optional[ResourceResponse]:
        pass

    @abstractmethod
    async def create(self, resource_in: ResourceCreate) -> ResourceResponse:
        pass

    @abstractmethod
    async def update(self, resource_id: str, update_in: ResourceUpdate) -> Optional[ResourceResponse]:
        pass

    @abstractmethod
    async def count_available(self) -> int:
        pass

    @abstractmethod
    async def count_total(self) -> int:
        pass


class IUserRepository(ABC):
    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        pass
