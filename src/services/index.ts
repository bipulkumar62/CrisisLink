/**
 * Service Layer Dependency Injection & Factory.
 *
 * Priority order:
 *   1. If VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set → use Supabase services (real data)
 *   2. If VITE_FORCE_MOCK=true → always use mock services
 *   3. Default fallback → mock services (safe for local dev without credentials)
 */

import { ENV } from '@/src/config/env';

// Interfaces
import { IIncidentService } from './interfaces/IIncidentService';
import { IReportService } from './interfaces/IReportService';
import { IResourceService } from './interfaces/IResourceService';
import { ISystemService } from './interfaces/ISystemService';
import { IAuthService } from './interfaces/IAuthService';

// Mock implementations
import { MockIncidentService } from './mock/mockIncidentService';
import { MockReportService } from './mock/mockReportService';
import { MockResourceService } from './mock/mockResourceService';
import { MockSystemService } from './mock/mockSystemService';
import { MockAuthService } from './mock/mockAuthService';

// Supabase implementations
import { SupabaseIncidentService } from './supabase/SupabaseIncidentService';
import { SupabaseReportService } from './supabase/SupabaseReportService';
import { SupabaseResourceService } from './supabase/SupabaseResourceService';
import { SupabaseSystemService } from './supabase/SupabaseSystemService';
import { SupabaseAuthService } from './supabase/SupabaseAuthService';

// Singleton mock instances (preserved for state continuity)
const mockIncidentService = new MockIncidentService();
const mockReportService = new MockReportService();
const mockResourceService = new MockResourceService();
const mockSystemService = new MockSystemService();
const mockAuthService = new MockAuthService();

// Singleton Supabase instances
const supabaseIncidentService = new SupabaseIncidentService();
const supabaseReportService = new SupabaseReportService();
const supabaseResourceService = new SupabaseResourceService();
const supabaseSystemService = new SupabaseSystemService();
const supabaseAuthService = new SupabaseAuthService();

export interface ServiceContainer {
  incidentService: IIncidentService;
  reportService: IReportService;
  resourceService: IResourceService;
  systemService: ISystemService;
  authService: IAuthService;
  isMockMode: boolean;
  isSupabaseMode: boolean;
}

export function createServices(): ServiceContainer {
  if (ENV.IS_SUPABASE_MODE) {
    console.info('[CrisisLink] 🟢 Supabase mode — live data from Supabase project nlpqlvcknpodvcukkddc');
    return {
      incidentService: supabaseIncidentService,
      reportService: supabaseReportService,
      resourceService: supabaseResourceService,
      systemService: supabaseSystemService,
      authService: supabaseAuthService,
      isMockMode: false,
      isSupabaseMode: true,
    };
  }

  console.info('[CrisisLink] 🟡 Mock mode — using in-memory demo data');
  return {
    incidentService: mockIncidentService,
    reportService: mockReportService,
    resourceService: mockResourceService,
    systemService: mockSystemService,
    authService: mockAuthService,
    isMockMode: true,
    isSupabaseMode: false,
  };
}

export const services = createServices();
