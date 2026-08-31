import { CitizenReport, ReportSubmissionPayload } from '@/src/types/report';
import { IReportService } from '../interfaces/IReportService';
import { INITIAL_MOCK_REPORTS } from './mockData';

export class MockReportService implements IReportService {
  private reports: CitizenReport[] = [...INITIAL_MOCK_REPORTS];

  async submitCitizenReport(payload: ReportSubmissionPayload): Promise<CitizenReport> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const tokenNumber = Math.floor(10000 + Math.random() * 90000);
    const trackingToken = `CR-${tokenNumber}`;

    const newReport: CitizenReport = {
      id: `rep-${Date.now()}`,
      trackingToken,
      incidentCategory: payload.category,
      severitySelfReported: payload.severity,
      description: payload.description,
      location: {
        address: payload.address,
        latitude: payload.latitude || 26.9124,
        longitude: payload.longitude || 75.7873,
        neighborhood: 'Metro Area',
      },
      reporter: {
        name: payload.reporterName,
        phone: payload.reporterPhone,
        email: payload.reporterEmail,
        isAnonymous: payload.isAnonymous,
        peopleAtRiskCount: payload.peopleAtRiskCount || 0,
      },
      evidence: (payload.evidenceFiles || []).map((file, idx) => ({
        id: `ev-${Date.now()}-${idx}`,
        type: file.type,
        name: file.name,
        sizeBytes: file.sizeBytes,
        extractedKeywords: ['urgent', 'emergency-field'],
        aiAnalysisSummary: `Citizen uploaded ${file.type.toLowerCase()} evidence.`,
      })),
      status: 'PENDING_TRIAGE',
      submittedAt: new Date().toISOString(),
      credibilityScore: payload.isAnonymous ? 85 : 95,
      aiExtractedUrgency: payload.severity === 'CRITICAL' ? 'URGENT' : 'STANDARD',
    };

    this.reports.unshift(newReport);
    return newReport;
  }

  async getReports(): Promise<CitizenReport[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return [...this.reports];
  }

  async getReportByTrackingToken(token: string): Promise<CitizenReport | null> {
    await new Promise((resolve) => setTimeout(resolve, 70));
    const cleanToken = token.trim().toUpperCase();
    return (
      this.reports.find(
        (r) => r.trackingToken.toUpperCase() === cleanToken || r.id === cleanToken
      ) || null
    );
  }

  async clusterReportToIncident(reportId: string, incidentId: string): Promise<CitizenReport> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const rep = this.reports.find((r) => r.id === reportId);
    if (!rep) {
      throw new Error(`Report ${reportId} not found`);
    }
    rep.status = 'CLUSTERED';
    rep.clusteredIncidentId = incidentId;
    return { ...rep };
  }
}
