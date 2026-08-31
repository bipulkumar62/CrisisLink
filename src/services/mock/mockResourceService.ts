import { ResourceUnit, UnitStatus } from '@/src/types/resource';
import { IResourceService } from '../interfaces/IResourceService';
import { INITIAL_MOCK_RESOURCES } from './mockData';

export class MockResourceService implements IResourceService {
  private resources: ResourceUnit[] = [...INITIAL_MOCK_RESOURCES];

  async getResources(): Promise<ResourceUnit[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return [...this.resources];
  }

  async getResourceById(id: string): Promise<ResourceUnit | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.resources.find((r) => r.id === id) || null;
  }

  async updateResourceStatus(
    id: string,
    status: UnitStatus,
    assignedIncidentId?: string
  ): Promise<ResourceUnit> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = this.resources.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Resource ${id} not found`);
    }

    const updated: ResourceUnit = {
      ...this.resources[index],
      status,
      assignedIncidentId: status === 'AVAILABLE' ? undefined : assignedIncidentId || this.resources[index].assignedIncidentId,
      lastPingAt: 'Just now',
    };

    this.resources[index] = updated;
    return updated;
  }
}
