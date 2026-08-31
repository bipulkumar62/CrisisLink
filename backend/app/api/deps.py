from backend.app.db.memory_repository import (
    InMemoryReportRepository,
    InMemoryIncidentRepository,
    InMemoryResourceRepository,
    InMemoryUserRepository,
)
from backend.app.services.report_service import ReportService
from backend.app.services.incident_service import IncidentService
from backend.app.services.resource_service import ResourceService
from backend.app.services.system_service import SystemService
from backend.app.services.auth_service import AuthService
from backend.app.security.auth import get_current_user

# Global singleton repository instances for memory persistence across requests
_report_repo = InMemoryReportRepository()
_incident_repo = InMemoryIncidentRepository()
_resource_repo = InMemoryResourceRepository()
_user_repo = InMemoryUserRepository()

# Global services
_report_service = ReportService(_report_repo)
_incident_service = IncidentService(_incident_repo, _resource_repo)
_resource_service = ResourceService(_resource_repo)
_system_service = SystemService(_incident_repo, _report_repo, _resource_repo)
_auth_service = AuthService(_user_repo)


def get_report_service() -> ReportService:
    return _report_service


def get_incident_service() -> IncidentService:
    return _incident_service


def get_resource_service() -> ResourceService:
    return _resource_service


def get_system_service() -> SystemService:
    return _system_service


def get_auth_service() -> AuthService:
    return _auth_service
