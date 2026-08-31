import React, { useState } from 'react';
import {
  Activity,
  Server,
  Radio,
  Zap,
  ShieldCheck,
  RefreshCw,
  Clock,
  HardDrive,
  Cpu,
  Globe,
  Bot,
  Database,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { SystemStatusSkeleton } from '@/src/components/common/SkeletonLoaders';
import { ServiceHealthStatus } from '@/src/types/system';

interface SystemStatusPageProps {
  onNavigate: (route: RoutePath) => void;
}

type SimulationScenario = 'ALL_GREEN' | 'API_DEGRADED' | 'AI_LATENCY' | 'DB_REPLICATION_LAG';

export const SystemStatusPage: React.FC<SystemStatusPageProps> = ({ onNavigate }) => {
  const { telemetry, refreshData, isLoading } = useEmergencyData();
  const [simulationScenario, setSimulationScenario] = useState<SimulationScenario>('ALL_GREEN');
  const [isProbing, setIsProbing] = useState(false);

  if (isLoading || isProbing) {
    return <SystemStatusSkeleton />;
  }

  const handleProbe = async () => {
    setIsProbing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await refreshData();
    setIsProbing(false);
  };

  // Compute live or simulated values for the 4 core services
  const coreServices = [
    {
      id: 'api',
      category: 'API',
      name: 'CAD Ingestion & Dispatch API Gateway',
      status: simulationScenario === 'API_DEGRADED' ? ('DEGRADED' as ServiceHealthStatus) : ('OPERATIONAL' as ServiceHealthStatus),
      latencyMs: simulationScenario === 'API_DEGRADED' ? 320 : 24,
      uptimePercent: 99.98,
      description: 'Ingests citizen eyewitness reports, emergency phone dispatch, and IoT sensor streams across Jaipur grid.',
      metrics: {
        'Throughput': simulationScenario === 'API_DEGRADED' ? '4,890 req/min (Spike)' : '1,420 req/min',
        'Error Rate': simulationScenario === 'API_DEGRADED' ? '3.4%' : '0.02%',
        'Protocol': 'REST v2 / WebSocket WSS',
        'Edge Location': 'Jaipur Municipal DC-1',
      },
    },
    {
      id: 'database',
      category: 'Database',
      name: 'Primary Geospatial Database & State Store',
      status: simulationScenario === 'DB_REPLICATION_LAG' ? ('DEGRADED' as ServiceHealthStatus) : ('OPERATIONAL' as ServiceHealthStatus),
      latencyMs: simulationScenario === 'DB_REPLICATION_LAG' ? 180 : 12,
      uptimePercent: 99.99,
      description: 'Stores real-time incident vectors, first responder unit positions, cordon boundaries, and CAD audit logs.',
      metrics: {
        'Active Connections': '34 / 200',
        'Replication Lag': simulationScenario === 'DB_REPLICATION_LAG' ? '820 ms (Catching Up)' : '8 ms',
        'Spatial Index': 'PostGIS R-Tree Quad',
        'Disk I/O': '4,200 IOPS',
      },
    },
    {
      id: 'storage',
      category: 'Storage',
      name: 'Encrypted Evidence Vault & Blob Store',
      status: 'OPERATIONAL' as ServiceHealthStatus,
      latencyMs: 45,
      uptimePercent: 100,
      description: 'Zero-knowledge encrypted media repository for citizen photos, voice transcripts, and CCTV video feeds.',
      metrics: {
        'Capacity Used': '142.6 GB / 1.0 TB',
        'Daily Ingestion': '8.4 GB / 24h',
        'Encryption': 'KMS Envelope AES-256',
        'Retention Policy': '180 Days Audited',
      },
    },
    {
      id: 'aiAnalysis',
      category: 'AI Analysis',
      name: 'AI Multi-Signal Deduplication & Vision Cluster Engine',
      status: simulationScenario === 'AI_LATENCY' ? ('DEGRADED' as ServiceHealthStatus) : ('OPERATIONAL' as ServiceHealthStatus),
      latencyMs: simulationScenario === 'AI_LATENCY' ? 480 : 88,
      uptimePercent: 99.95,
      description: 'Multimodal Gemini vision pipeline extracting urgency, cross-referencing sensor feeds, and clustering dossiers.',
      metrics: {
        'Model Pipeline': 'Gemini 1.5 Flash Multimodal',
        'Cluster Accuracy': '98.4%',
        'Queue Depth': simulationScenario === 'AI_LATENCY' ? '14 items queued' : '0 items pending',
        'Inference Avg': simulationScenario === 'AI_LATENCY' ? '480 ms' : '88 ms',
      },
    },
  ];

  const getStatusBadge = (status: ServiceHealthStatus) => {
    switch (status) {
      case 'OPERATIONAL':
        return (
          <span className="px-2 py-0.5 rounded font-mono-data text-[10px] font-bold border uppercase bg-emerald-50 text-[#16803A] border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16803A]"></span>
            Operational
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="px-2 py-0.5 rounded font-mono-data text-[10px] font-bold border uppercase bg-amber-50 text-[#D97706] border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Degraded Latency
          </span>
        );
      case 'OUTAGE':
      default:
        return (
          <span className="px-2 py-0.5 rounded font-mono-data text-[10px] font-bold border uppercase bg-red-50 text-[#D92D20] border-red-200 flex items-center gap-1">
            Outage
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16 p-4 lg:p-6 bg-[#F7F8FA] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E0E7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16803A] animate-pulse"></span>
            <span className="text-xs font-bold font-mono-data text-[#16803A] uppercase tracking-wider">
              Core CAD Infrastructure Diagnostics
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#101828] font-heading tracking-tight">
            System Status & Service Health
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Monitor the four core emergency platform services: Ingestion API, Geospatial Database, Evidence Storage, and AI Analysis.
          </p>
        </div>

        <button
          onClick={handleProbe}
          disabled={isLoading}
          className="px-4 py-2 bg-white border border-[#D9E0E7] hover:bg-slate-50 text-slate-800 rounded text-xs font-bold font-mono-data flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Execute Health Probe</span>
        </button>
      </div>

      {/* Interactive Isolated Demo Simulation Bar */}
      <div className="bg-white border border-[#D9E0E7] rounded-xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold font-mono-data text-slate-800 uppercase">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Isolated Demo Service Simulators</span>
          </div>
          <span className="text-[10px] font-mono-data text-slate-500">
            Simulate realistic infrastructure states without breaking live demo
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSimulationScenario('ALL_GREEN')}
            className={`px-3 py-1.5 rounded text-xs font-mono-data font-bold border transition-colors ${
              simulationScenario === 'ALL_GREEN'
                ? 'bg-[#0B1F33] text-white border-[#0B1F33]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            ✓ All Systems Operational
          </button>
          <button
            type="button"
            onClick={() => setSimulationScenario('API_DEGRADED')}
            className={`px-3 py-1.5 rounded text-xs font-mono-data font-bold border transition-colors ${
              simulationScenario === 'API_DEGRADED'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Simulate API High Traffic & Latency
          </button>
          <button
            type="button"
            onClick={() => setSimulationScenario('AI_LATENCY')}
            className={`px-3 py-1.5 rounded text-xs font-mono-data font-bold border transition-colors ${
              simulationScenario === 'AI_LATENCY'
                ? 'bg-purple-100 text-purple-900 border-purple-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Simulate AI Multimodal Inference Queue
          </button>
          <button
            type="button"
            onClick={() => setSimulationScenario('DB_REPLICATION_LAG')}
            className={`px-3 py-1.5 rounded text-xs font-mono-data font-bold border transition-colors ${
              simulationScenario === 'DB_REPLICATION_LAG'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Simulate DB Replication Lag
          </button>
        </div>
      </div>

      {/* Top 4 Core Services Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {coreServices.map((svc) => (
          <div
            key={svc.id}
            className="bg-white p-4 rounded-xl border border-[#D9E0E7] shadow-xs space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-data">
                  {svc.category}
                </span>
                {getStatusBadge(svc.status)}
              </div>
              <h3 className="font-heading font-bold text-sm text-[#101828]">
                {svc.name}
              </h3>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono-data">
              <div>
                <span className="text-slate-400 block text-[10px]">Latency</span>
                <span className={`font-bold ${svc.latencyMs > 100 ? 'text-[#D97706]' : 'text-slate-900'}`}>
                  {svc.latencyMs} ms
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Uptime</span>
                <span className="font-bold text-[#16803A]">{svc.uptimePercent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deep Dive Cards for the 4 Core Services: API, Database, Storage, AI Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {coreServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-white border border-[#D9E0E7] rounded-xl p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  {srv.category === 'API' && <Globe className="w-4 h-4 text-blue-600" />}
                  {srv.category === 'Database' && <Database className="w-4 h-4 text-emerald-600" />}
                  {srv.category === 'Storage' && <HardDrive className="w-4 h-4 text-indigo-600" />}
                  {srv.category === 'AI Analysis' && <Bot className="w-4 h-4 text-purple-600" />}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#101828]">
                    {srv.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono-data uppercase">
                    Category: {srv.category}
                  </span>
                </div>
              </div>

              {getStatusBadge(srv.status)}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {srv.description}
            </p>

            {/* Metrics Breakdown Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs font-mono-data">
              {Object.entries(srv.metrics).map(([key, val]) => (
                <div key={key} className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase">{key}:</span>
                  <span className="font-bold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
