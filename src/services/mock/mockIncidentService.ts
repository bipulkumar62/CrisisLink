import { Incident, IncidentStatus } from '@/src/types/incident';
import { IIncidentService, IncidentFilterOptions } from '../interfaces/IIncidentService';
import { INITIAL_MOCK_INCIDENTS } from './mockData';

export class MockIncidentService implements IIncidentService {
  private incidents: Incident[] = [...INITIAL_MOCK_INCIDENTS];

  async getIncidents(filters?: IncidentFilterOptions): Promise<Incident[]> {
    // Simulate brief network latency
    await new Promise((resolve) => setTimeout(resolve, 80));

    let result = [...this.incidents];

    if (filters) {
      if (filters.severity && filters.severity !== 'ALL') {
        result = result.filter((inc) => inc.severity === filters.severity);
      }
      if (filters.status && filters.status !== 'ALL') {
        result = result.filter((inc) => inc.status === filters.status);
      }
      if (filters.searchQuery?.trim()) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(
          (inc) =>
            inc.code.toLowerCase().includes(q) ||
            inc.title.toLowerCase().includes(q) ||
            inc.location.address.toLowerCase().includes(q) ||
            inc.location.sector.toLowerCase().includes(q)
        );
      }
    }

    return result;
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.incidents.find((inc) => inc.id === id) || null;
  }

  async getIncidentByCode(code: string): Promise<Incident | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return (
      this.incidents.find((inc) => inc.code.toLowerCase() === code.toLowerCase()) ||
      null
    );
  }

  async updateIncidentStatus(id: string, status: IncidentStatus): Promise<Incident> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = this.incidents.findIndex((inc) => inc.id === id);
    if (index === -1) {
      throw new Error(`Incident with id ${id} not found`);
    }

    const updated = {
      ...this.incidents[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.incidents[index] = updated;
    return updated;
  }

  async assignResourceToIncident(incidentId: string, resourceId: string): Promise<Incident> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = this.incidents.findIndex((inc) => inc.id === incidentId);
    if (index === -1) {
      throw new Error(`Incident with id ${incidentId} not found`);
    }

    const inc = this.incidents[index];
    if (!inc.assignedResourceIds.includes(resourceId)) {
      inc.assignedResourceIds.push(resourceId);
    }
    inc.updatedAt = new Date().toISOString();
    return { ...inc };
  }

  async removeResourceFromIncident(incidentId: string, resourceId: string): Promise<Incident> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = this.incidents.findIndex((inc) => inc.id === incidentId);
    if (index === -1) {
      throw new Error(`Incident with id ${incidentId} not found`);
    }

    const inc = this.incidents[index];
    inc.assignedResourceIds = inc.assignedResourceIds.filter((r) => r !== resourceId);
    inc.updatedAt = new Date().toISOString();
    return { ...inc };
  }

  async createIncident(payload: Partial<Incident>): Promise<Incident> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const newCode = `CL-${120 + this.incidents.length + 1}`;
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      code: newCode,
      title: payload.title || 'Reported Emergency Incident',
      description: payload.description || '',
      category: payload.category || 'OTHER',
      severity: payload.severity || 'HIGH',
      status: 'ACTIVE',
      location: payload.location || {
        address: 'Downtown Sector',
        sector: 'Sector 1 - Central',
        latitude: 37.7749,
        longitude: -122.4194,
      },
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reportsAggregatedCount: 1,
      evidence: {
        photoCount: payload.evidence?.photoCount || 0,
        textLogCount: payload.evidence?.textLogCount || 1,
        audioCount: payload.evidence?.audioCount || 0,
        sensorLogCount: 0,
      },
      signals: [
        {
          id: `sig-${Date.now()}`,
          type: 'AI_OBSERVATION',
          message: 'Initial triage performed. Severity determined from incoming citizen report.',
          timestamp: 'Just now',
          source: 'CrisisLink Core Engine',
        },
      ],
      priority: {
        overall: payload.severity === 'CRITICAL' ? 85 : 65,
        tier: payload.severity === 'CRITICAL' ? 'CRITICAL TIER' : 'HIGH TIER',
        lifeThreatRisk: payload.severity === 'CRITICAL' ? 'Severe' : 'Moderate',
        infrastructureRisk: 'Moderate',
        confidenceScore: 88,
        aiConfidenceLabel: 'HIGH',
      },
      recommendedResources: [
        {
          unitId: 'res-r05',
          unitCode: 'R05',
          name: 'Heavy Rescue Squad R05',
          type: 'RESCUE',
          etaMinutes: 5,
          available: true,
        },
      ],
      assignedResourceIds: [],
      isPubliclyVisible: true,
      publicSummary: payload.description || 'Emergency reported. First responders triaging situation.',
      ...payload,
    };

    this.incidents.unshift(newIncident);
    return newIncident;
  }
}
