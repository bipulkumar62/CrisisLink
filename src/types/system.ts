/**
 * System Telemetry & Health Types
 */

export type ServiceHealthStatus = 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';

export interface CoreSystemServices {
  api: {
    name: 'CAD Ingestion & Dispatch API';
    status: ServiceHealthStatus;
    latencyMs: number;
    uptimePercent: number;
    rpm: number;
    errorRatePercent: number;
  };
  database: {
    name: 'Primary Operational Database';
    status: ServiceHealthStatus;
    latencyMs: number;
    uptimePercent: number;
    activeConnections: number;
    replicationLagMs: number;
  };
  storage: {
    name: 'Encrypted Evidence Vault & Blob Storage';
    status: ServiceHealthStatus;
    latencyMs: number;
    uptimePercent: number;
    usedStorageGb: number;
    totalStorageGb: number;
  };
  aiAnalysis: {
    name: 'AI Multi-Signal Deduplication & Vision Cluster Engine';
    status: ServiceHealthStatus;
    latencyMs: number;
    uptimePercent: number;
    model: string;
    queueDepth: number;
  };
}

export interface SystemServiceHealth {
  id: 'api' | 'database' | 'storage' | 'aiAnalysis';
  name: string;
  category: 'API' | 'Database' | 'Storage' | 'AI Analysis';
  status: ServiceHealthStatus;
  latencyMs: number;
  uptimePercent: number;
  description: string;
  metrics: { [key: string]: string | number };
}

export interface SystemTelemetry {
  status: 'ONLINE' | 'DEGRADED' | 'CRITICAL';
  lastSyncAt: string;
  activeIncidentsCount: number;
  criticalIncidentsCount: number;
  highIncidentsCount: number;
  availableResourcesCount: number;
  resolvedIncidentsCount: number;
  totalReportsIngested24h: number;
  pipelineLatencyMs: number;
  coreServices?: CoreSystemServices;
  services: SystemServiceHealth[];
  websocketBroker?: {
    status: 'HEALTHY' | 'DEGRADED';
    connectedNodes: number;
    messagesPerSecond: number;
  };
  aiInferenceEngine: {
    status: 'OPERATIONAL' | 'ACTIVE' | 'WARM';
    model: string;
    averageClusteringLatencyMs: number;
    confidenceThreshold?: number;
    deduplicationAccuracyPercent?: number;
  };
}

