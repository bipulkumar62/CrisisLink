from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from backend.app.models.enums import IncidentCategory, IncidentSeverity, ReportStatus


class LocationCoord(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate")
    address: str = Field(..., min_length=2, max_length=300, description="Street or landmark description")
    neighborhood: Optional[str] = Field(None, description="Jaipur Municipal Ward / Sector")


class ReporterInfo(BaseModel):
    is_anonymous: bool = Field(default=False)
    name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    people_at_risk_count: Optional[int] = Field(default=0, ge=0, description="Estimated people affected")


class EvidenceAttachment(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(default="PHOTO", description="PHOTO or AUDIO")
    url: Optional[str] = None
    size_bytes: Optional[int] = Field(None, le=25 * 1024 * 1024, description="Max 25MB")


class CitizenReportCreate(BaseModel):
    """Payload for submitting a new citizen emergency report."""
    category: IncidentCategory = Field(..., description="Type of disaster hazard")
    severity: IncidentSeverity = Field(default=IncidentSeverity.HIGH, description="Self-reported severity")
    description: str = Field(..., min_length=8, max_length=2000, description="Eyewitness description")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    address: str = Field(..., min_length=3, max_length=300)
    neighborhood: Optional[str] = None
    is_anonymous: bool = Field(default=False)
    reporter_name: Optional[str] = Field(None, max_length=100)
    reporter_phone: Optional[str] = Field(None, max_length=20)
    people_at_risk_count: Optional[int] = Field(default=0, ge=0)
    evidence_files: Optional[List[EvidenceAttachment]] = Field(default_factory=list)

    @field_validator("description")
    @classmethod
    def validate_desc_not_blank(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 8:
            raise ValueError("Description must contain at least 8 non-whitespace characters.")
        return cleaned


class CitizenReportResponse(BaseModel):
    """Response returned upon citizen report ingestion."""
    id: str
    tracking_token: str
    incident_category: IncidentCategory
    severity_self_reported: IncidentSeverity
    status: ReportStatus
    description: str
    location: LocationCoord
    reporter: ReporterInfo
    evidence: List[EvidenceAttachment] = []
    credibility_score: int
    created_at: datetime
    updated_at: datetime
    assigned_incident_id: Optional[str] = None


class CitizenReportListResponse(BaseModel):
    items: List[CitizenReportResponse]
    total: int
