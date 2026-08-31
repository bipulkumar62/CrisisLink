import { SystemTelemetry } from '@/src/types/system';
import { ISystemService } from '../interfaces/ISystemService';
import { INITIAL_MOCK_TELEMETRY } from './mockData';

export class MockSystemService implements ISystemService {
  async getSystemTelemetry(): Promise<SystemTelemetry> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      ...INITIAL_MOCK_TELEMETRY,
      lastSyncAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
