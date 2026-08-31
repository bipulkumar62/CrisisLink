from typing import List, Optional
from backend.app.db.base_repository import IReportRepository
from backend.app.schemas.report import CitizenReportCreate, CitizenReportResponse
from backend.app.utils.error_handlers import NotFoundException
from backend.app.utils.logger import logger


class ReportService:
    def __init__(self, report_repo: IReportRepository):
        self.report_repo = report_repo

    async def submit_report(self, report_in: CitizenReportCreate) -> CitizenReportResponse:
        logger.info(f"Ingesting citizen emergency report: category={report_in.category.value}, address={report_in.address}")
        created_report = await self.report_repo.create(report_in)
        logger.info(f"Citizen report ingested successfully with tracking token {created_report.tracking_token}")
        return created_report

    async def get_report_by_id_or_token(self, identifier: str) -> CitizenReportResponse:
        report = await self.report_repo.get_by_id(identifier)
        if not report:
            report = await self.report_repo.get_by_token(identifier)
        if not report:
            raise NotFoundException(f"Citizen report '{identifier}' could not be located in CAD database.")
        return report

    async def list_reports(
        self,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[CitizenReportResponse]:
        return await self.report_repo.list_all(status=status, limit=limit, offset=offset)

    async def get_total_count(self, status: Optional[str] = None) -> int:
        return await self.report_repo.count(status=status)
