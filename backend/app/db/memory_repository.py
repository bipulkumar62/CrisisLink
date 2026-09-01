import asyncio
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import uuid

from backend.app.db.base_repository import (
    IReportRepository,
    IIncidentRepository,
    IResourceRepository,
    IUserRepository,
)
from backend.app.security.auth import hash_password
from backend.app.schemas.report import (
    CitizenReportCreate,
    CitizenReportResponse,
    LocationCoord,
    ReporterInfo,
    EvidenceAttachment,
)
from backend.app.schemas.incident import (
    IncidentPublicResponse,
    IncidentAdminResponse,
    IncidentStatusUpdate,
    IncidentActionLog,
    ResourceAssignmentItem,
)
from backend.app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourceResponse,
)
from backend.app.models.enums import (
    IncidentCategory,
    IncidentSeverity,
    IncidentStatus,
    ReportStatus,
    ResourceType,
    ResourceStatus,
    UserRole,
)


class InMemoryReportRepository(IReportRepository):
    def __init__(self):
        self._lock = asyncio.Lock()
        self._reports: Dict[str, CitizenReportResponse] = {}
        self._seed_initial_data()

    def _seed_initial_data(self):
        now = datetime.now(timezone.utc)
        sample = CitizenReportResponse(
            id="rep-101",
            tracking_token="CR-JP-89241",
            incident_category=IncidentCategory.FLOOD,
            severity_self_reported=IncidentSeverity.HIGH,
            status=ReportStatus.CLUSTERED,
            description="Water level exceeding 4 feet near Paanch Batti intersection on MI Road. Commercial basements submerged and two vehicles stalled in drainage backflow.",
            location=LocationCoord(
                latitude=26.9180,
                longitude=75.8150,
                address="MI Road & Paanch Batti Circle, Jaipur",
                neighborhood="Sector 3",
            ),
            reporter=ReporterInfo(
                is_anonymous=False,
                name="Anil Verma",
                phone="+91 98290 11234",
                people_at_risk_count=15,
            ),
            evidence=[
                EvidenceAttachment(
                    id="ev-1",
                    name="paanch_batti_flood.jpg",
                    type="PHOTO",
                    url="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
                    size_bytes=1840000,
                )
            ],
            credibility_score=94,
            created_at=now,
            updated_at=now,
            assigned_incident_id="inc-jaipur-01",
        )
        self._reports[sample.id] = sample

    async def create(self, report_in: CitizenReportCreate) -> CitizenReportResponse:
        async with self._lock:
            now = datetime.now(timezone.utc)
            report_id = f"rep-{uuid.uuid4().hex[:8]}"
            import random
            token_num = random.randint(10000, 99999)
            token = f"CR-JP-{token_num}"

            # Calculate baseline credibility score from submitted evidence
            credibility = 70
            if report_in.evidence_files and len(report_in.evidence_files) > 0:
                credibility += 15
            if not report_in.is_anonymous and report_in.reporter_phone:
                credibility += 10
            if report_in.people_at_risk_count and report_in.people_at_risk_count > 0:
                credibility += 5
            credibility = min(98, credibility)

            evidence_items = []
            for i, ev in enumerate(report_in.evidence_files or []):
                evidence_items.append(
                    EvidenceAttachment(
                        id=f"ev-{uuid.uuid4().hex[:6]}",
                        name=ev.name,
                        type=ev.type,
                        url=ev.url,
                        size_bytes=ev.size_bytes,
                    )
                )

            report = CitizenReportResponse(
                id=report_id,
                tracking_token=token,
                incident_category=report_in.category,
                severity_self_reported=report_in.severity,
                status=ReportStatus.PENDING_TRIAGE,
                description=report_in.description,
                location=LocationCoord(
                    latitude=report_in.latitude,
                    longitude=report_in.longitude,
                    address=report_in.address,
                    neighborhood=report_in.neighborhood or "Jaipur Central",
                ),
                reporter=ReporterInfo(
                    is_anonymous=report_in.is_anonymous,
                    name=report_in.reporter_name if not report_in.is_anonymous else None,
                    phone=report_in.reporter_phone if not report_in.is_anonymous else None,
                    people_at_risk_count=report_in.people_at_risk_count or 0,
                ),
                evidence=evidence_items,
                credibility_score=credibility,
                created_at=now,
                updated_at=now,
            )
            self._reports[report_id] = report
            return report

    async def get_by_id(self, report_id: str) -> Optional[CitizenReportResponse]:
        async with self._lock:
            return self._reports.get(report_id)

    async def get_by_token(self, token: str) -> Optional[CitizenReportResponse]:
        async with self._lock:
            for rep in self._reports.values():
                if rep.tracking_token.upper() == token.upper():
                    return rep
            return None

    async def list_all(
        self,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[CitizenReportResponse]:
        async with self._lock:
            items = list(self._reports.values())
            if status:
                items = [r for r in items if r.status.value == status or r.status == status]
            items.sort(key=lambda x: x.created_at, reverse=True)
            return items[offset : offset + limit]

    async def count(self, status: Optional[str] = None) -> int:
        async with self._lock:
            if status:
                return len([r for r in self._reports.values() if r.status == status])
            return len(self._reports)


class InMemoryIncidentRepository(IIncidentRepository):
    def __init__(self):
        self._lock = asyncio.Lock()
        self._incidents: Dict[str, IncidentAdminResponse] = {}
        self._seed_initial_data()

    def _seed_initial_data(self):
        now = datetime.now(timezone.utc)
        self._incidents["inc-jaipur-01"] = IncidentAdminResponse(
            id="inc-jaipur-01",
            code="INC-2026-JP-001",
            title="Severe Flash Inundation & Drain Breach at MI Road",
            category=IncidentCategory.FLOOD,
            severity=IncidentSeverity.CRITICAL,
            status=IncidentStatus.DISPATCHED,
            location=LocationCoord(
                latitude=26.9180,
                longitude=75.8150,
                address="MI Road & Paanch Batti Circle, Jaipur",
                neighborhood="Sector 3 - C-Scheme Environs",
            ),
            affected_radius_meters=350,
            safe_zone_guidance="Evacuate ground floors. Move north toward Ajmeri Gate elevated ridge. Avoid basements.",
            reported_at=now,
            updated_at=now,
            corroboration_count=8,
            is_verified=True,
            ai_priority_score=94,
            ai_confidence_score=0.96,
            ai_observation_summary="Multi-signal convergence of 8 citizen voice reports, 3 geotagged photos showing 4.2ft water depth, and SCADA municipal storm drain surge sensors.",
            ai_suggested_action="Dispatch SDRF high-clearance rescue boat, deploy dewatering pump truck to Paanch Batti, and divert traffic from Government Hostel junction.",
            corroborated_report_ids=["rep-101"],
            assigned_resources=[
                ResourceAssignmentItem(
                    resource_id="res-boat-01",
                    resource_callsign="SDRF-INFLATABLE-1",
                    resource_type="RESCUE_BOAT",
                    assigned_at=now,
                    status="DISPATCHED",
                )
            ],
            action_logs=[
                IncidentActionLog(
                    id="log-1",
                    action="TRIAGED_AI_CRITICAL",
                    performed_by="AI Multi-Signal Engine",
                    timestamp=now,
                    notes="Priority calculated at 94/100 due to commercial density and rising water trend.",
                ),
                IncidentActionLog(
                    id="log-2",
                    action="UNIT_DISPATCHED",
                    performed_by="CAD Dispatcher #402",
                    timestamp=now,
                    notes="SDRF Rescue Unit 1 deployed from Police Lines.",
                ),
            ],
            evidence_vault=[
                EvidenceAttachment(
                    id="ev-1",
                    name="mi_road_flooding.jpg",
                    type="PHOTO",
                    url="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
                )
            ],
            people_impacted_estimate=45,
        )

        self._incidents["inc-jaipur-02"] = IncidentAdminResponse(
            id="inc-jaipur-02",
            code="INC-2026-JP-002",
            title="Structural Wall Failure & Live Electrical Hazard",
            category=IncidentCategory.STRUCTURE_COLLAPSE,
            severity=IncidentSeverity.HIGH,
            status=IncidentStatus.VERIFIED,
            location=LocationCoord(
                latitude=26.9240,
                longitude=75.8280,
                address="Johari Bazaar, Near Badi Chaupar, Walled City",
                neighborhood="Sector 1 - Heritage Corridor",
            ),
            affected_radius_meters=180,
            safe_zone_guidance="Clear 100m perimeter around collapsed parapet wall. Do not step on standing water near downed lines.",
            reported_at=now,
            updated_at=now,
            corroboration_count=5,
            is_verified=True,
            ai_priority_score=88,
            ai_confidence_score=0.91,
            ai_observation_summary="Confirmed structural collapse of 120-year-old masonry parapet. High voltage transformer sparked adjacent to market pedestrian footway.",
            ai_suggested_action="Isolate local electrical grid feeder via JVVNL portal and establish police containment cordon.",
            corroborated_report_ids=[],
            assigned_resources=[],
            action_logs=[
                IncidentActionLog(
                    id="log-1",
                    action="VERIFIED_BY_POLICE",
                    performed_by="Manak Chowk Police Station",
                    timestamp=now,
                    notes="Area isolated with barricades.",
                )
            ],
            evidence_vault=[],
            people_impacted_estimate=20,
        )

    async def list_public(
        self,
        category: Optional[IncidentCategory] = None,
        severity: Optional[IncidentSeverity] = None,
        status: Optional[IncidentStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[IncidentPublicResponse]:
        async with self._lock:
            items = list(self._incidents.values())
            if category:
                items = [i for i in items if i.category == category]
            if severity:
                items = [i for i in items if i.severity == severity]
            if status:
                items = [i for i in items if i.status == status]
            else:
                # By default public feed excludes rejected
                items = [i for i in items if i.status != IncidentStatus.REJECTED]

            items.sort(key=lambda x: x.reported_at, reverse=True)
            subset = items[offset : offset + limit]

            return [
                IncidentPublicResponse(
                    id=inc.id,
                    code=inc.code,
                    title=inc.title,
                    category=inc.category,
                    severity=inc.severity,
                    status=inc.status,
                    location=inc.location,
                    affected_radius_meters=inc.affected_radius_meters,
                    safe_zone_guidance=inc.safe_zone_guidance,
                    reported_at=inc.reported_at,
                    updated_at=inc.updated_at,
                    corroboration_count=inc.corroboration_count,
                    is_verified=inc.is_verified,
                )
                for inc in subset
            ]

    async def list_admin(
        self,
        category: Optional[IncidentCategory] = None,
        severity: Optional[IncidentSeverity] = None,
        status: Optional[IncidentStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[IncidentAdminResponse]:
        async with self._lock:
            items = list(self._incidents.values())
            if category:
                items = [i for i in items if i.category == category]
            if severity:
                items = [i for i in items if i.severity == severity]
            if status:
                items = [i for i in items if i.status == status]

            items.sort(key=lambda x: x.ai_priority_score, reverse=True)
            return items[offset : offset + limit]

    async def get_by_id(self, incident_id: str) -> Optional[IncidentAdminResponse]:
        async with self._lock:
            return self._incidents.get(incident_id)

    async def get_by_code(self, code: str) -> Optional[IncidentAdminResponse]:
        async with self._lock:
            for inc in self._incidents.values():
                if inc.code.upper() == code.upper():
                    return inc
            return None

    async def update_status(
        self,
        incident_id: str,
        update_in: IncidentStatusUpdate,
    ) -> Optional[IncidentAdminResponse]:
        async with self._lock:
            target = self._incidents.get(incident_id)
            if not target:
                return None

            now = datetime.now(timezone.utc)
            target.status = update_in.status
            target.updated_at = now
            target.action_logs.append(
                IncidentActionLog(
                    id=f"log-{uuid.uuid4().hex[:6]}",
                    action=f"STATUS_CHANGE_{update_in.status.value}",
                    performed_by=update_in.operator_name or "CAD Dispatcher",
                    timestamp=now,
                    notes=update_in.notes or f"Status transitioned to {update_in.status.value}",
                )
            )
            return target

    async def assign_resources(
        self,
        incident_id: str,
        resource_ids: List[str],
        operator_name: str,
        notes: Optional[str] = None,
    ) -> Optional[IncidentAdminResponse]:
        async with self._lock:
            target = self._incidents.get(incident_id)
            if not target:
                return None

            now = datetime.now(timezone.utc)
            for res_id in resource_ids:
                # Add assignment if not already assigned
                exists = any(a.resource_id == res_id for a in target.assigned_resources)
                if not exists:
                    target.assigned_resources.append(
                        ResourceAssignmentItem(
                            resource_id=res_id,
                            resource_callsign=f"UNIT-{res_id[-4:].upper()}",
                            resource_type="EMERGENCY_UNIT",
                            assigned_at=now,
                            status="DISPATCHED",
                        )
                    )

            target.status = IncidentStatus.DISPATCHED
            target.updated_at = now
            target.action_logs.append(
                IncidentActionLog(
                    id=f"log-{uuid.uuid4().hex[:6]}",
                    action="UNITS_DISPATCHED",
                    performed_by=operator_name,
                    timestamp=now,
                    notes=notes or f"Dispatched {len(resource_ids)} tactical unit(s).",
                )
            )
            return target

    async def count_active(self) -> int:
        async with self._lock:
            return len([i for i in self._incidents.values() if i.status not in [IncidentStatus.RESOLVED, IncidentStatus.REJECTED]])

    async def count_critical(self) -> int:
        async with self._lock:
            return len([i for i in self._incidents.values() if i.severity == IncidentSeverity.CRITICAL and i.status not in [IncidentStatus.RESOLVED, IncidentStatus.REJECTED]])


class InMemoryResourceRepository(IResourceRepository):
    def __init__(self):
        self._lock = asyncio.Lock()
        self._resources: Dict[str, ResourceResponse] = {}
        self._seed_initial_data()

    def _seed_initial_data(self):
        now = datetime.now(timezone.utc)
        initial = [
            ResourceResponse(
                id="res-boat-01",
                name="SDRF Inflatable Rescue Boat 1",
                callsign="SDRF-BOAT-01",
                type=ResourceType.RESCUE_BOAT,
                status=ResourceStatus.BUSY,
                location=LocationCoord(
                    latitude=26.9180,
                    longitude=75.8150,
                    address="Paanch Batti / MI Road Junction",
                    neighborhood="Sector 3",
                ),
                assigned_incident_id="inc-jaipur-01",
                assigned_incident_code="INC-2026-JP-001",
                crew_count=4,
                capacity_total=8,
                capacity_occupied=3,
                fuel_level_percent=85,
                battery_level_percent=92,
                updated_at=now,
            ),
            ResourceResponse(
                id="res-amb-01",
                name="SMS Hospital ALS Ambulance 04",
                callsign="MED-ALS-04",
                type=ResourceType.AMBULANCE,
                status=ResourceStatus.AVAILABLE,
                location=LocationCoord(
                    latitude=26.8920,
                    longitude=75.8160,
                    address="SMS Hospital Trauma Staging, JLN Marg",
                    neighborhood="Sector 2",
                ),
                crew_count=3,
                fuel_level_percent=95,
                battery_level_percent=98,
                updated_at=now,
            ),
            ResourceResponse(
                id="res-fire-01",
                name="Jaipur Fire Brigade Tender 02",
                callsign="FIRE-TENDER-02",
                type=ResourceType.FIRE_TRUCK,
                status=ResourceStatus.AVAILABLE,
                location=LocationCoord(
                    latitude=26.9200,
                    longitude=75.8050,
                    address="Chandpole Fire Station",
                    neighborhood="Sector 1",
                ),
                crew_count=6,
                fuel_level_percent=80,
                updated_at=now,
            ),
            ResourceResponse(
                id="res-shelter-01",
                name="SMS Stadium Relief Shelter",
                callsign="SHELTER-STADIUM-A",
                type=ResourceType.SHELTER,
                status=ResourceStatus.AVAILABLE,
                location=LocationCoord(
                    latitude=26.8950,
                    longitude=75.8050,
                    address="Sawai Mansingh Indoor Stadium",
                    neighborhood="Sector 2",
                ),
                crew_count=12,
                capacity_total=500,
                capacity_occupied=140,
                updated_at=now,
            ),
        ]
        for r in initial:
            self._resources[r.id] = r

    async def list_all(
        self,
        status: Optional[ResourceStatus] = None,
        type_filter: Optional[str] = None,
    ) -> List[ResourceResponse]:
        async with self._lock:
            items = list(self._resources.values())
            if status:
                items = [r for r in items if r.status == status]
            if type_filter:
                items = [r for r in items if r.type.value == type_filter or r.type == type_filter]
            return items

    async def get_by_id(self, resource_id: str) -> Optional[ResourceResponse]:
        async with self._lock:
            return self._resources.get(resource_id)

    async def create(self, resource_in: ResourceCreate) -> ResourceResponse:
        async with self._lock:
            now = datetime.now(timezone.utc)
            res_id = f"res-{uuid.uuid4().hex[:6]}"
            new_res = ResourceResponse(
                id=res_id,
                name=resource_in.name,
                callsign=resource_in.callsign,
                type=resource_in.type,
                status=ResourceStatus.AVAILABLE,
                location=LocationCoord(
                    latitude=resource_in.latitude,
                    longitude=resource_in.longitude,
                    address=resource_in.address,
                ),
                crew_count=resource_in.crew_count,
                capacity_total=resource_in.capacity_total,
                capacity_occupied=resource_in.capacity_occupied or 0,
                fuel_level_percent=resource_in.fuel_level_percent,
                battery_level_percent=resource_in.battery_level_percent,
                updated_at=now,
            )
            self._resources[res_id] = new_res
            return new_res

    async def update(self, resource_id: str, update_in: ResourceUpdate) -> Optional[ResourceResponse]:
        async with self._lock:
            target = self._resources.get(resource_id)
            if not target:
                return None

            now = datetime.now(timezone.utc)
            if update_in.status is not None:
                target.status = update_in.status
            if update_in.assigned_incident_id is not None:
                target.assigned_incident_id = update_in.assigned_incident_id
            if update_in.latitude is not None and update_in.longitude is not None:
                target.location.latitude = update_in.latitude
                target.location.longitude = update_in.longitude
            if update_in.address is not None:
                target.location.address = update_in.address
            if update_in.capacity_occupied is not None:
                target.capacity_occupied = update_in.capacity_occupied
            if update_in.fuel_level_percent is not None:
                target.fuel_level_percent = update_in.fuel_level_percent
            if update_in.battery_level_percent is not None:
                target.battery_level_percent = update_in.battery_level_percent

            target.updated_at = now
            return target

    async def count_available(self) -> int:
        async with self._lock:
            return len([r for r in self._resources.values() if r.status == ResourceStatus.AVAILABLE])

    async def count_total(self) -> int:
        async with self._lock:
            return len(self._resources)


class InMemoryUserRepository(IUserRepository):
    def __init__(self):
        self._users = {
            "dispatcher": {
                "id": "usr-402",
                "username": "dispatcher",
                "password": hash_password("password123"),
                "full_name": "Rajesh Sharma",
                "badge_number": "RAJ-CAD-402",
                "role": UserRole.DISPATCHER,
                "agency": "Jaipur Police CAD Command",
            },
            "commander": {
                "id": "usr-101",
                "username": "commander",
                "password": hash_password("password123"),
                "full_name": "Col. Vikram Rathore",
                "badge_number": "SDRF-CMD-01",
                "role": UserRole.INCIDENT_COMMANDER,
                "agency": "State Disaster Response Force (SDRF)",
            },
        }

    async def get_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        return self._users.get(username.lower().strip())
