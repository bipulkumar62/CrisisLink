/**
 * Citizen Report & Evidence Types
 */

import { IncidentCategory, IncidentSeverity } from './incident';

export interface EvidenceItem {
  id: string;
  type: 'PHOTO' | 'TEXT' | 'AUDIO';
  url?: string;
  previewUrl?: string;
  name: string;
  sizeBytes?: number;
  extractedKeywords?: string[];
  aiAnalysisSummary?: string;
}

export type CitizenReportStatus = 'PENDING_TRIAGE' | 'CLUSTERED' | 'VERIFIED' | 'DISMISSED';

export interface CitizenReport {
  id: string;
  trackingToken: string; // e.g. "CR-89241"
  incidentCategory: IncidentCategory;
  severitySelfReported: IncidentSeverity;
  description: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
    neighborhood?: string;
  };
  reporter: {
    name?: string;
    phone?: string;
    email?: string;
    isAnonymous: boolean;
    peopleAtRiskCount?: number;
  };
  evidence: EvidenceItem[];
  status: CitizenReportStatus;
  clusteredIncidentId?: string; // Links to an Incident code if merged
  submittedAt: string;
  credibilityScore: number; // 0-100%
  aiExtractedUrgency: 'URGENT' | 'STANDARD' | 'INFORMATIONAL';
}

export interface ReportSubmissionPayload {
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  isAnonymous: boolean;
  reporterName?: string;
  reporterPhone?: string;
  reporterEmail?: string;
  peopleAtRiskCount?: number;
  evidenceFiles?: { name: string; type: 'PHOTO' | 'TEXT' | 'AUDIO'; sizeBytes: number }[];
}
