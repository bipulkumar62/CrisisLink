import { SystemTelemetry } from '@/src/types/system';

export interface ISystemService {
  getSystemTelemetry(): Promise<SystemTelemetry>;
}
