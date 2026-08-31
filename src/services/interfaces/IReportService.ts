import { CitizenReport, ReportSubmissionPayload } from '@/src/types/report';

export interface IReportService {
  submitCitizenReport(payload: ReportSubmissionPayload): Promise<CitizenReport>;
  getReports(): Promise<CitizenReport[]>;
  getReportByTrackingToken(token: string): Promise<CitizenReport | null>;
  clusterReportToIncident(reportId: string, incidentId: string): Promise<CitizenReport>;
}
