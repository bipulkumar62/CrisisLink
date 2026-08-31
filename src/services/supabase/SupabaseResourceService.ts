/**
 * SupabaseResourceService
 * Real implementation of IResourceService backed by Supabase resources table.
 */

import { supabase } from '@/src/lib/supabaseClient';
import { ResourceUnit, UnitStatus } from '@/src/types/resource';
import { IResourceService } from '../interfaces/IResourceService';

// ─── DB Row → Domain Mapper ─────────────────────────────────────────────────

function rowToResource(row: Record<string, unknown>): ResourceUnit {
  return {
    id: row.id as string,
    callsign: row.callsign as string,
    name: row.name as string | undefined,
    type: row.type as ResourceUnit['type'],
    status: row.status as ResourceUnit['status'],
    station: row.station as string,
    assignedIncidentId: row.assigned_incident_id as string | undefined,
    personnelCount: row.personnel_count as number,
    equipmentSummary: (row.equipment_summary as string[]) || [],
    batteryOrFuelPercent: row.battery_or_fuel_percent as number,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    lastPingAt: row.last_ping_at as string | undefined,
    lastLocationUpdate: row.last_location_update as string | undefined,
    specialties: (row.specialties as string[]) || [],
    // Shelter-specific
    capacityBeds: row.capacity_beds as number | undefined,
    occupancyCurrent: row.occupancy_current as number | undefined,
    contactNumber: row.contact_number as string | undefined,
    shelterManager: row.shelter_manager as string | undefined,
    hasMedicalAid: row.has_medical_aid as boolean | undefined,
  };
}

// ─── Service Class ──────────────────────────────────────────────────────────

export class SupabaseResourceService implements IResourceService {
  async getResources(): Promise<ResourceUnit[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('callsign', { ascending: true });

    if (error) throw new Error(`[SupabaseResourceService] getResources: ${error.message}`);
    return (data || []).map(rowToResource);
  }

  async getResourceById(id: string): Promise<ResourceUnit | null> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`[SupabaseResourceService] getResourceById: ${error.message}`);
    }
    return data ? rowToResource(data) : null;
  }

  async updateResourceStatus(
    id: string,
    status: UnitStatus,
    assignedIncidentId?: string
  ): Promise<ResourceUnit> {
    const updatePayload: Record<string, unknown> = {
      status,
      last_ping_at: new Date().toISOString(),
    };

    if (assignedIncidentId !== undefined) {
      updatePayload.assigned_incident_id = assignedIncidentId;
    } else if (status === 'AVAILABLE' || status === 'RETURNING') {
      // Clear assignment when freeing up the unit
      updatePayload.assigned_incident_id = null;
    }

    const { data, error } = await supabase
      .from('resources')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`[SupabaseResourceService] updateResourceStatus: ${error.message}`);
    if (!data) throw new Error(`Resource ${id} not found after update`);
    return rowToResource(data);
  }
}
