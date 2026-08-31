import { Incident, IncidentSeverity, IncidentStatus } from '@/src/types/incident';

export interface IncidentFilterOptions {
  severity?: IncidentSeverity | 'ALL';
  status?: IncidentStatus | 'ALL';
  searchQuery?: string;
  category?: string;
}

export interface IIncidentService {
  getIncidents(filters?: IncidentFilterOptions): Promise<Incident[]>;
  getIncidentById(id: string): Promise<Incident | null>;
  getIncidentByCode(code: string): Promise<Incident | null>;
  updateIncidentStatus(id: string, status: IncidentStatus): Promise<Incident>;
  assignResourceToIncident(incidentId: string, resourceId: string): Promise<Incident>;
  removeResourceFromIncident(incidentId: string, resourceId: string): Promise<Incident>;
  createIncident(payload: Partial<Incident>): Promise<Incident>;
}
