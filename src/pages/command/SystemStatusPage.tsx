import React from 'react';
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
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';

interface SystemStatusPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const SystemStatusPage: React.FC<SystemStatusPageProps> = ({ onNavigate }) => {
  const { telemetry, refreshData, isLoading } = useEmergencyData();

  return (
    <div className="space-y-6 pb-16 p-4 lg:p-6 bg-[#fbf9fb] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c4c6cd]/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold font-mono-data text-emerald-700 uppercase tracking-wider">
              CAD Core Telemetry & Mesh
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#00050e] font-heading">
            System Health & Pipeline Diagnostics
          </h1>
          <p className="text-xs text-[#74777d] mt-0.5">
            Real-time pipeline latency, AI inference engine status, WebSocket broker health, and service uptime.
          </p>
        </div>

        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-colors self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Run Health Probe
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#c4c6cd]/60 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-data">
            Pipeline Latency
          </span>
          <span className="text-2xl font-bold font-mono-data text-[#0051d5] block">
            {telemetry?.pipelineLatencyMs || 42} ms
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold font-mono-data">
            Optimal (Sub-50ms)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c4c6cd]/60 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-data">
            AI Multi-Signal Engine
          </span>
          <span className="text-2xl font-bold font-mono-data text-slate-900 block">
            {telemetry?.aiInferenceEngine.averageClusteringLatencyMs || 120} ms
          </span>
          <span className="text-[11px] text-purple-600 font-mono-data font-semibold">
            {telemetry?.aiInferenceEngine.model || 'Gemini Flash Multimodal'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c4c6cd]/60 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-data">
            Active Incidents
          </span>
          <span className="text-2xl font-bold font-mono-data text-red-600 block">
            {telemetry?.activeIncidentsCount || 12}
          </span>
          <span className="text-[11px] text-slate-500 font-mono-data">
            {telemetry?.criticalIncidentsCount || 4} Critical Priority
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c4c6cd]/60 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-data">
            Fleet Readiness
          </span>
          <span className="text-2xl font-bold font-mono-data text-emerald-600 block">
            {telemetry?.availableResourcesCount || 9} Units
          </span>
          <span className="text-[11px] text-slate-500 font-mono-data">Ready for dispatch</span>
        </div>
      </div>

      {/* Microservice Architecture List */}
      <div className="bg-white border border-[#c4c6cd]/60 rounded-xl p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-data">
          Core Engine Microservices
        </h3>

        <div className="divide-y divide-slate-100">
          {telemetry?.services.map((srv) => (
            <div key={srv.name} className="py-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{srv.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono-data font-bold rounded border border-emerald-200 uppercase">
                    {srv.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{srv.description}</p>
              </div>

              <div className="text-right font-mono-data text-xs shrink-0">
                <span className="text-slate-900 font-bold block">{srv.uptimePercent}% uptime</span>
                <span className="text-slate-500 text-[11px]">{srv.latencyMs}ms latency</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
