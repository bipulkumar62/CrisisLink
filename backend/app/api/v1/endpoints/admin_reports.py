from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from backend.app.schemas.report import CitizenReportResponse
from backend.app.schemas.common import APIResponse
from backend.app.schemas.auth import UserProfile
from backend.app.services.report_service import ReportService
from backend.app.api.deps import get_report_service
from backend.app.security.auth import get_current_user

router = APIRouter()


@router.get(
    "/reports",
    response_model=APIResponse[List[CitizenReportResponse]],
    summary="List citizen eyewitness reports for triage review",
    description="Returns raw ingested citizen emergency reports with credibility scoring, contact info, and attached evidence files.",
)
async def list_admin_reports(
    status: Optional[str] = Query(None, description="Filter by report status (PENDING_TRIAGE, CLUSTERED, VERIFIED, etc.)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: UserProfile = Depends(get_current_user),
    report_service: ReportService = Depends(get_report_service),
) -> APIResponse[List[CitizenReportResponse]]:
    reports = await report_service.list_reports(status=status, limit=limit, offset=offset)
    return APIResponse(
        success=True,
        message=f"Retrieved {len(reports)} citizen reports.",
        data=reports,
    )
