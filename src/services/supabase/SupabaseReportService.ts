/**
 * SupabaseReportService
 * Real implementation of IReportService backed by Supabase citizen_reports table.
 */

import { supabase } from '@/src/lib/supabaseClient';
import { CitizenReport, ReportSubmissionPayload } from '@/src/types/report';
import { IReportService } from '../interfaces/IReportService';

// ─── DB Row → Domain Mapper ─────────────────────────────────────────────────

function rowToReport(row: Record<string, unknown>): CitizenReport {
  return {
    id: row.id as string,
    trackingToken: row.tracking_token as string,
    incidentCategory: row.incident_category as CitizenReport['incidentCategory'],
    severitySelfReported: row.severity_self_reported as CitizenReport['severitySelfReported'],
    description: row.description as string,
    location: row.location as CitizenReport['location'],
    reporter: row.reporter as CitizenReport['reporter'],
    evidence: (row.evidence as CitizenReport['evidence']) || [],
    status: row.status as CitizenReport['status'],
    clusteredIncidentId: row.clustered_incident_id as string | undefined,
    credibilityScore: row.credibility_score as number,
    aiExtractedUrgency: row.ai_extracted_urgency as CitizenReport['aiExtractedUrgency'],
    submittedAt: row.submitted_at as string,
  };
}

// ─── Tracking Token Generator ───────────────────────────────────────────────

function generateTrackingToken(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `CR-${num}`;
}

// ─── Credibility Score Heuristic ────────────────────────────────────────────

function computeCredibilityScore(payload: ReportSubmissionPayload): number {
  let score = 40;
  if (!payload.isAnonymous) score += 20;
  if (payload.reporterPhone) score += 10;
  if (payload.reporterEmail) score += 5;
  if (payload.evidenceFiles && payload.evidenceFiles.length > 0) score += 15;
  if (payload.latitude && payload.longitude) score += 10;
  return Math.min(score, 100);
}

// ─── Urgency Classifier ─────────────────────────────────────────────────────

function classifyUrgency(severity: string): CitizenReport['aiExtractedUrgency'] {
  if (severity === 'CRITICAL' || severity === 'HIGH') return 'URGENT';
  if (severity === 'LOW') return 'INFORMATIONAL';
  return 'STANDARD';
}

// ─── Service Class ──────────────────────────────────────────────────────────

export class SupabaseReportService implements IReportService {
  async submitCitizenReport(payload: ReportSubmissionPayload): Promise<CitizenReport> {
    const trackingToken = generateTrackingToken();

    const row = {
      id: `rep-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      tracking_token: trackingToken,
      incident_category: payload.category,
      severity_self_reported: payload.severity,
      description: payload.description,
      location: {
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      reporter: {
        name: payload.reporterName,
        phone: payload.reporterPhone,
        email: payload.reporterEmail,
        isAnonymous: payload.isAnonymous,
        peopleAtRiskCount: payload.peopleAtRiskCount,
      },
      evidence: (payload.evidenceFiles || []).map((f, idx) => ({
        id: `ev-${Date.now()}-${idx}`,
        type: f.type,
        name: f.name,
        sizeBytes: f.sizeBytes,
      })),
      status: 'PENDING_TRIAGE',
      credibility_score: computeCredibilityScore(payload),
      ai_extracted_urgency: classifyUrgency(payload.severity),
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('citizen_reports')
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`[SupabaseReportService] submitCitizenReport: ${error.message}`);
    return rowToReport(data);
  }

  async getReports(): Promise<CitizenReport[]> {
    const { data, error } = await supabase
      .from('citizen_reports')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw new Error(`[SupabaseReportService] getReports: ${error.message}`);
    return (data || []).map(rowToReport);
  }

  async getReportByTrackingToken(token: string): Promise<CitizenReport | null> {
    const { data, error } = await supabase
      .from('citizen_reports')
      .select('*')
      .eq('tracking_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`[SupabaseReportService] getReportByTrackingToken: ${error.message}`);
    }
    return data ? rowToReport(data) : null;
  }

  async clusterReportToIncident(reportId: string, incidentId: string): Promise<CitizenReport> {
    const { data, error } = await supabase
      .from('citizen_reports')
      .update({ clustered_incident_id: incidentId, status: 'CLUSTERED' })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw new Error(`[SupabaseReportService] clusterReportToIncident: ${error.message}`);
    return rowToReport(data);
  }
}
