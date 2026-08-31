import { ResourceUnit, UnitStatus } from '@/src/types/resource';

export interface IResourceService {
  getResources(): Promise<ResourceUnit[]>;
  getResourceById(id: string): Promise<ResourceUnit | null>;
  updateResourceStatus(id: string, status: UnitStatus, assignedIncidentId?: string): Promise<ResourceUnit>;
}
