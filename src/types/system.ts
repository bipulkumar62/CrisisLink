/**
 * System Telemetry & Health Types
 */

export interface SystemServiceHealth {
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  latencyMs: number;
  uptimePercent: number;
  description: string;
}

export interface SystemTelemetry {
  status: 'ONLINE' | 'DEGRADED' | 'CRITICAL';
  lastSyncAt: string;
  activeIncidentsCount: number;
  criticalIncidentsCount: number;
  highIncidentsCount: number;
  availableResourcesCount: number;
  resolvedIncidentsCount: number;
  pipelineLatencyMs: number;
  services: SystemServiceHealth[];
  aiInferenceEngine: {
    status: 'ACTIVE' | 'WARM';
    model: string;
    averageClusteringLatencyMs: number;
    confidenceThreshold: number;
  };
}
