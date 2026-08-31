/**
 * Incident Domain Types
 */

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'ACTIVE' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'ACTIVE' | 'TRIAGED' | 'DISPATCHED' | 'ON_SCENE' | 'CONTAINED' | 'RESOLVED';
export type IncidentCategory =
  | 'FLOOD'
  | 'FIRE'
  | 'TRAFFIC'
  | 'POWER_OUTAGE'
  | 'HAZMAT'
  | 'EARTHQUAKE'
  | 'MEDICAL'
  | 'STRUCTURE_COLLAPSE'
  | 'OTHER';

export interface IncidentSignal {
  id: string;
  type: 'WARNING' | 'CRITICAL_BLOCK' | 'INFRASTRUCTURE' | 'SAFETY_ADVICE' | 'AI_OBSERVATION';
  message: string;
  timestamp: string;
  source: string;
  icon?: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  type: 'INGESTION' | 'AI_CLUSTERING' | 'TRIAGE_VERIFIED' | 'DISPATCH' | 'ON_SCENE' | 'STATUS_UPDATE' | 'CONTAINMENT';
  title: string;
  description: string;
  actor: string;
}

export interface IncidentCorroboration {
  score: number; // 0-100%
  reportCount: number;
  sensorConfirmation: boolean;
  trustedReporterCount: number;
  crossValidationNotes: string;
}

export interface IncidentPriorityScore {
  overall: number; // 0-100
  tier: 'CRITICAL TIER' | 'HIGH TIER' | 'ELEVATED TIER' | 'STANDARD TIER';
  lifeThreatRisk: 'Severe' | 'High' | 'Moderate' | 'Low';
  infrastructureRisk: 'Severe' | 'High' | 'Moderate' | 'Low';
  spreadVelocity?: 'Fast' | 'Moderate' | 'Contained';
  vulnerablePopulation?: number;
  confidenceScore: number; // 0-100%
  aiConfidenceLabel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface IncidentLocation {
  address: string;
  sector: string;
  latitude: number;
  longitude: number;
  landmarks?: string;
  elevationMeters?: number;
  cordonRadiusMeters?: number;
}

export interface IncidentEvidenceSummary {
  photoCount: number;
  textLogCount: number;
  audioCount: number;
  sensorLogCount: number;
  items?: Array<{
    id: string;
    type: 'PHOTO' | 'AUDIO' | 'TEXT' | 'SENSOR';
    title: string;
    description: string;
    timestamp: string;
    source: string;
    url?: string;
  }>;
}

export interface IncidentRecommendedResource {
  unitId: string;
  unitCode: string;
  name: string;
  type: 'RESCUE' | 'AMBULANCE' | 'FIRE_ENGINE' | 'FIRE_UNIT' | 'SHELTER' | 'HAZMAT' | 'POLICE' | 'DRONE';
  etaMinutes: number;
  available: boolean;
}

export interface Incident {
  id: string;
  code: string; // e.g. "CL-JP-102"
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: IncidentLocation;
  reportedAt: string;
  updatedAt: string;
  reportsAggregatedCount: number;
  evidence: IncidentEvidenceSummary;
  signals: IncidentSignal[];
  priority: IncidentPriorityScore;
  recommendedResources: IncidentRecommendedResource[];
  assignedResourceIds: string[];
  timeline?: IncidentTimelineEvent[];
  corroboration?: IncidentCorroboration;
  associatedReportTokens?: string[];
  publicSummary?: string;
  evacuationRadiusMeters?: number;
  isPubliclyVisible: boolean;
}
