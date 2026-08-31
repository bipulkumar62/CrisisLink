from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from backend.app.models.enums import IncidentCategory, IncidentSeverity, IncidentStatus
from backend.app.schemas.report import LocationCoord, EvidenceAttachment


class IncidentActionLog(BaseModel):
    id: str
    action: str
    performed_by: str
    timestamp: datetime
    notes: Optional[str] = None


class ResourceAssignmentItem(BaseModel):
    resource_id: str
    resource_callsign: str
    resource_type: str
    assigned_at: datetime
    status: str


class IncidentPublicResponse(BaseModel):
    """Publicly visible incident summary for citizen awareness & map."""
    id: str
    code: str
    title: str
    category: IncidentCategory
    severity: IncidentSeverity
    status: IncidentStatus
    location: LocationCoord
    affected_radius_meters: int
    safe_zone_guidance: str
    reported_at: datetime
    updated_at: datetime
    corroboration_count: int
    is_verified: bool


class IncidentAdminResponse(IncidentPublicResponse):
    """Full operational dossier for dispatchers & commanders."""
    ai_priority_score: int = Field(..., ge=0, le=100)
    ai_confidence_score: float = Field(..., ge=0.0, le=1.0)
    ai_observation_summary: str
    ai_suggested_action: str
    corroborated_report_ids: List[str] = []
    assigned_resources: List[ResourceAssignmentItem] = []
    action_logs: List[IncidentActionLog] = []
    evidence_vault: List[EvidenceAttachment] = []
    people_impacted_estimate: int = 0


class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus = Field(..., description="New CAD incident status")
    notes: Optional[str] = Field(None, max_length=500, description="Audit log justification notes")
    operator_name: Optional[str] = Field("CAD Dispatcher #402", max_length=100)


class IncidentAssignResource(BaseModel):
    resource_ids: List[str] = Field(..., min_length=1, description="List of resource IDs to dispatch")
    dispatch_notes: Optional[str] = Field(None, max_length=500)
    operator_name: Optional[str] = Field("CAD Dispatcher #402", max_length=100)


class IncidentListPublicResponse(BaseModel):
    items: List[IncidentPublicResponse]
    total: int


class IncidentListAdminResponse(BaseModel):
    items: List[IncidentAdminResponse]
    total: int
