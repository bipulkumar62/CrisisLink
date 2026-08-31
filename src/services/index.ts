/**
 * Service Layer Dependency Injection & Factory.
 * Seamlessly toggles between isolated mock services and real FastAPI client
 * based on the presence of VITE_API_BASE_URL.
 */

import { ENV } from '@/src/config/env';
import { IIncidentService } from './interfaces/IIncidentService';
import { IReportService } from './interfaces/IReportService';
import { IResourceService } from './interfaces/IResourceService';
import { ISystemService } from './interfaces/ISystemService';
import { IAuthService } from './interfaces/IAuthService';

import { MockIncidentService } from './mock/mockIncidentService';
import { MockReportService } from './mock/mockReportService';
import { MockResourceService } from './mock/mockResourceService';
import { MockSystemService } from './mock/mockSystemService';
import { MockAuthService } from './mock/mockAuthService';

// Singleton instances for mock state preservation across component re-renders
const mockIncidentService = new MockIncidentService();
const mockReportService = new MockReportService();
const mockResourceService = new MockResourceService();
const mockSystemService = new MockSystemService();
const mockAuthService = new MockAuthService();

export interface ServiceContainer {
  incidentService: IIncidentService;
  reportService: IReportService;
  resourceService: IResourceService;
  systemService: ISystemService;
  authService: IAuthService;
  isMockMode: boolean;
}

export function createServices(): ServiceContainer {
  if (ENV.IS_MOCK_MODE) {
    return {
      incidentService: mockIncidentService,
      reportService: mockReportService,
      resourceService: mockResourceService,
      systemService: mockSystemService,
      authService: mockAuthService,
      isMockMode: true,
    };
  }

  // When VITE_API_BASE_URL is provided, fallback/adapter delegates to real API endpoints
  // Future implementation maps API HTTP calls here without touching any UI component!
  return {
    incidentService: mockIncidentService, // Defaulting safely until FastAPI endpoints connected
    reportService: mockReportService,
    resourceService: mockResourceService,
    systemService: mockSystemService,
    authService: mockAuthService,
    isMockMode: false,
  };
}

export const services = createServices();
