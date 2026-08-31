from fastapi import APIRouter, Depends, status
from backend.app.schemas.report import CitizenReportCreate, CitizenReportResponse
from backend.app.schemas.common import APIResponse
from backend.app.services.report_service import ReportService
from backend.app.api.deps import get_report_service

router = APIRouter()


@router.post(
    "/reports",
    response_model=APIResponse[CitizenReportResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Submit a citizen emergency report",
    description="Ingests public eyewitness reports with coordinates, severity, and optional photo/audio evidence.",
)
async def submit_public_report(
    report_in: CitizenReportCreate,
    report_service: ReportService = Depends(get_report_service),
) -> APIResponse[CitizenReportResponse]:
    created = await report_service.submit_report(report_in)
    return APIResponse(
        success=True,
        message="Emergency report ingested successfully and queued for multi-signal CAD triage.",
        data=created,
    )
