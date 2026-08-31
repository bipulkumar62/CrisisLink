/**
 * SupabaseIncidentService
 * Real implementation of IIncidentService backed by Supabase.
 * Maps snake_case DB columns to camelCase Incident TypeScript types.
 */

import { supabase } from '@/src/lib/supabaseClient';
import { Incident, IncidentStatus } from '@/src/types/incident';
import { IIncidentService, IncidentFilterOptions } from '../interfaces/IIncidentService';

// ─── DB Row → Domain Mapper ─────────────────────────────────────────────────

function rowToIncident(row: Record<string, unknown>): Incident {
  return {
    id: row.id as string,
    code: row.code as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as Incident['category'],
    severity: row.severity as Incident['severity'],
    status: row.status as Incident['status'],
    location: row.location as Incident['location'],
    evidence: row.evidence as Incident['evidence'],
    signals: (row.signals as Incident['signals']) || [],
    priority: row.priority as Incident['priority'],
    recommendedResources: (row.recommended_resources as Incident['recommendedResources']) || [],
    assignedResourceIds: (row.assigned_resource_ids as string[]) || [],
    timeline: (row.timeline as Incident['timeline']) || [],
    corroboration: row.corroboration as Incident['corroboration'],
    associatedReportTokens: (row.associated_report_tokens as string[]) || [],
    reportsAggregatedCount: row.reports_aggregated_count as number,
    isPubliclyVisible: row.is_publicly_visible as boolean,
    publicSummary: row.public_summary as string | undefined,
    evacuationRadiusMeters: row.evacuation_radius_meters as number | undefined,
    reportedAt: row.reported_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── Service Class ──────────────────────────────────────────────────────────

export class SupabaseIncidentService implements IIncidentService {
  async getIncidents(filters?: IncidentFilterOptions): Promise<Incident[]> {
    let query = supabase.from('incidents').select('*').order('reported_at', { ascending: false });

    if (filters?.severity && filters.severity !== 'ALL') {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }
    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.trim();
      query = query.or(
        `code.ilike.%${q}%,title.ilike.%${q}%`
      );
    }

    const { data, error } = await query;
    if (error) throw new Error(`[SupabaseIncidentService] getIncidents: ${error.message}`);
    return (data || []).map(rowToIncident);
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // no rows
      throw new Error(`[SupabaseIncidentService] getIncidentById: ${error.message}`);
    }
    return data ? rowToIncident(data) : null;
  }

  async getIncidentByCode(code: string): Promise<Incident | null> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .ilike('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`[SupabaseIncidentService] getIncidentByCode: ${error.message}`);
    }
    return data ? rowToIncident(data) : null;
  }

  async updateIncidentStatus(id: string, status: IncidentStatus): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`[SupabaseIncidentService] updateIncidentStatus: ${error.message}`);
    if (!data) throw new Error(`Incident ${id} not found after update`);
    return rowToIncident(data);
  }

  async assignResourceToIncident(incidentId: string, resourceId: string): Promise<Incident> {
    // First fetch current assigned_resource_ids
    const { data: current, error: fetchError } = await supabase
      .from('incidents')
      .select('assigned_resource_ids')
      .eq('id', incidentId)
      .single();

    if (fetchError) throw new Error(`[SupabaseIncidentService] assignResource fetch: ${fetchError.message}`);

    const existing: string[] = (current?.assigned_resource_ids as string[]) || [];
    const updated = existing.includes(resourceId) ? existing : [...existing, resourceId];

    const { data, error } = await supabase
      .from('incidents')
      .update({ assigned_resource_ids: updated, updated_at: new Date().toISOString() })
      .eq('id', incidentId)
      .select()
      .single();

    if (error) throw new Error(`[SupabaseIncidentService] assignResourceToIncident: ${error.message}`);
    return rowToIncident(data);
  }

  async removeResourceFromIncident(incidentId: string, resourceId: string): Promise<Incident> {
    const { data: current, error: fetchError } = await supabase
      .from('incidents')
      .select('assigned_resource_ids')
      .eq('id', incidentId)
      .single();

    if (fetchError) throw new Error(`[SupabaseIncidentService] removeResource fetch: ${fetchError.message}`);

    const existing: string[] = (current?.assigned_resource_ids as string[]) || [];
    const updated = existing.filter((r) => r !== resourceId);

    const { data, error } = await supabase
      .from('incidents')
      .update({ assigned_resource_ids: updated, updated_at: new Date().toISOString() })
      .eq('id', incidentId)
      .select()
      .single();

    if (error) throw new Error(`[SupabaseIncidentService] removeResourceFromIncident: ${error.message}`);
    return rowToIncident(data);
  }

  async createIncident(payload: Partial<Incident>): Promise<Incident> {
    const incidentCount = await supabase.from('incidents').select('id', { count: 'exact', head: true });
    const nextNum = 120 + (incidentCount.count || 0) + 1;
    const newCode = payload.code || `CL-JP-${nextNum}`;

    const row = {
      id: `inc-${Date.now()}`,
      code: newCode,
      title: payload.title || 'Reported Emergency Incident',
      description: payload.description || '',
      category: payload.category || 'OTHER',
      severity: payload.severity || 'HIGH',
      status: 'ACTIVE',
      location: payload.location || {
        address: 'Jaipur City Centre',
        sector: 'Sector 1 - Walled City',
        latitude: 26.9124,
        longitude: 75.7873,
      },
      evidence: payload.evidence || { photoCount: 0, textLogCount: 1, audioCount: 0, sensorLogCount: 0 },
      signals: payload.signals || [
        {
          id: `sig-${Date.now()}`,
          type: 'AI_OBSERVATION',
          message: 'Initial triage performed. Severity determined from incoming citizen report.',
          timestamp: new Date().toISOString(),
          source: 'CrisisLink Core Engine',
        },
      ],
      priority: payload.priority || {
        overall: payload.severity === 'CRITICAL' ? 85 : 65,
        tier: payload.severity === 'CRITICAL' ? 'CRITICAL TIER' : 'HIGH TIER',
        lifeThreatRisk: payload.severity === 'CRITICAL' ? 'Severe' : 'Moderate',
        infrastructureRisk: 'Moderate',
        confidenceScore: 88,
        aiConfidenceLabel: 'HIGH',
      },
      recommended_resources: payload.recommendedResources || [],
      assigned_resource_ids: payload.assignedResourceIds || [],
      reports_aggregated_count: payload.reportsAggregatedCount || 1,
      is_publicly_visible: payload.isPubliclyVisible !== undefined ? payload.isPubliclyVisible : true,
      public_summary: payload.publicSummary || payload.description || 'Emergency reported. First responders triaging situation.',
      reported_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('incidents')
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`[SupabaseIncidentService] createIncident: ${error.message}`);
    return rowToIncident(data);
  }
}
