/**
 * First Responder Resource & Unit Fleet Types
 */

export type UnitType =
  | 'AMBULANCE'
  | 'RESCUE_TEAM'
  | 'FIRE_UNIT'
  | 'FIRE_ENGINE'
  | 'SHELTER'
  | 'POLICE_PATROL'
  | 'HAZMAT_TRUCK'
  | 'DRONE_RECON'
  | 'MOBILE_COMMAND';

export type UnitStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'BUSY'
  | 'OFFLINE'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'RETURNING'
  | 'MAINTENANCE';

export interface ResourceUnit {
  id: string;
  callsign: string; // e.g. "SDRF-02", "EMS-01", "SHELTER-01"
  name?: string;
  type: UnitType;
  status: UnitStatus;
  station: string;
  assignedIncidentId?: string; // Links to current Incident
  personnelCount: number;
  equipmentSummary: string[];
  batteryOrFuelPercent: number;
  latitude: number;
  longitude: number;
  lastPingAt?: string;
  lastLocationUpdate?: string;
  specialties: string[];
  // Shelter specific fields
  capacityBeds?: number;
  occupancyCurrent?: number;
  contactNumber?: string;
  shelterManager?: string;
  hasMedicalAid?: boolean;
}

