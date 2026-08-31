from typing import List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class SubsystemHealth(BaseModel):
    name: str
    status: str  # 'OPERATIONAL', 'DEGRADED', 'OUTAGE'
    latency_ms: int
    uptime_percent: float
    description: str


class SystemStatusResponse(BaseModel):
    system_name: str
    overall_status: str
    region: str
    environment: str
    timestamp: datetime
    active_incidents_count: int
    unassigned_reports_count: int
    available_units_count: int
    subsystems: List[SubsystemHealth]


class DashboardStatsResponse(BaseModel):
    active_incidents: int
    critical_incidents: int
    pending_citizen_reports: int
    available_fleet_units: int
    total_fleet_units: int
    shelter_occupancy_percent: float
    ai_cluster_accuracy_percent: float
    median_dispatch_time_seconds: int
