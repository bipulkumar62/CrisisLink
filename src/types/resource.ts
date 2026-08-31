/**
 * First Responder Resource & Unit Fleet Types
 */

export type UnitType =
  | 'RESCUE_TEAM'
  | 'AMBULANCE'
  | 'FIRE_ENGINE'
  | 'POLICE_PATROL'
  | 'HAZMAT_TRUCK'
  | 'DRONE_RECON'
  | 'MOBILE_COMMAND';

export type UnitStatus = 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'RETURNING' | 'MAINTENANCE';

export interface ResourceUnit {
  id: string;
  callsign: string; // e.g. "Rescue Team R02", "Ambulance A01"
  type: UnitType;
  status: UnitStatus;
  station: string;
  assignedIncidentId?: string; // Links to current Incident
  personnelCount: number;
  equipmentSummary: string[];
  batteryOrFuelPercent: number;
  latitude: number;
  longitude: number;
  lastPingAt: string;
  specialties: string[];
}
