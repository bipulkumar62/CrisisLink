from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from backend.app.models.enums import ResourceType, ResourceStatus
from backend.app.schemas.report import LocationCoord


class ResourceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    callsign: str = Field(..., min_length=2, max_length=50)
    type: ResourceType
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    address: str = Field(..., min_length=2, max_length=300)
    crew_count: int = Field(default=2, ge=0)
    capacity_total: Optional[int] = Field(None, ge=0)
    capacity_occupied: Optional[int] = Field(None, ge=0)
    fuel_level_percent: Optional[int] = Field(None, ge=0, le=100)
    battery_level_percent: Optional[int] = Field(None, ge=0, le=100)


class ResourceUpdate(BaseModel):
    status: Optional[ResourceStatus] = None
    assigned_incident_id: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    address: Optional[str] = None
    capacity_occupied: Optional[int] = None
    fuel_level_percent: Optional[int] = None
    battery_level_percent: Optional[int] = None


class ResourceResponse(BaseModel):
    id: str
    name: str
    callsign: str
    type: ResourceType
    status: ResourceStatus
    location: LocationCoord
    assigned_incident_id: Optional[str] = None
    assigned_incident_code: Optional[str] = None
    crew_count: int
    capacity_total: Optional[int] = None
    capacity_occupied: Optional[int] = None
    fuel_level_percent: Optional[int] = None
    battery_level_percent: Optional[int] = None
    updated_at: datetime


class ResourceListResponse(BaseModel):
    items: List[ResourceResponse]
    total: int
