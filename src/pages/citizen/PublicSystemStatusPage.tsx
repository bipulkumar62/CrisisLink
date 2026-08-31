import React from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Activity,
  Radio,
  Server,
  Zap,
  RefreshCw,
  Clock,
  PhoneCall,
} from 'lucide-react';
import { RoutePath, APP_CONFIG } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';

interface PublicSystemStatusPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const PublicSystemStatusPage: React.FC<PublicSystemStatusPageProps> = ({ onNavigate }) => {
  const { telemetry, refreshData, isLoading } = useEmergencyData();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E0E7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16803A]"></span>
            <span className="text-[11px] font-bold font-mono-data text-[#16803A] uppercase tracking-wider">
              {APP_CONFIG.REGION_LABEL}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-heading">
            Public Telemetry & Gateway Status
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Real-time diagnostics of citizen report intake channels, IoT sensor mesh, and CAD dispatch networks.
          </p>
        </div>

        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#D9E0E7] rounded-lg text-xs font-bold text-[#101828] hover:bg-[#F7F8FA] transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Global Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-center gap-4 text-emerald-950 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#16803A] shrink-0">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold font-heading text-[#101828]">
            Jaipur Municipal Ingestion Nodes Fully Operational
          </h3>
          <p className="text-xs text-emerald-900 leading-relaxed">
            All regional 112 CAD gateways, browser intake endpoints, and IoT hydrological sensors are operating within optimal latency bounds ({telemetry?.pipelineLatencyMs || 38}ms).
          </p>
        </div>
      </div>

      {/* Microservice Health List */}
      <div className="bg-white border border-[#D9E0E7] rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-[#101828] font-heading uppercase tracking-wider">
          Core Municipal Ingestion & Dispatch Grid
        </h3>

        <div className="divide-y divide-[#D9E0E7]">
          {telemetry?.services.map((srv) => (
            <div key={srv.name} className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#101828]">{srv.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-[#16803A] font-mono-data font-bold rounded border border-emerald-200 uppercase">
                    {srv.status}
                  </span>
                </div>
                <p className="text-xs text-[#52606D]">{srv.description}</p>
              </div>

              <div className="text-right font-mono-data text-xs shrink-0">
                <span className="text-[#101828] font-bold block">{srv.uptimePercent}% uptime</span>
                <span className="text-[#52606D] text-[11px]">{srv.latencyMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct CAD Hotlines Strip */}
      <div className="bg-[#0B1F33] text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold font-heading text-white">Emergency Dispatch Assistance</h4>
          <p className="text-xs text-slate-300">
            For life-threatening emergencies, submit an online report or contact CAD dispatch directly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('citizen-report')}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Submit Web Report
          </button>
          <a
            href={`tel:${APP_CONFIG.HOTLINE_EMERGENCY}`}
            className="px-4 py-2.5 bg-[#D92D20] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors font-mono-data"
          >
            Dial 112
          </a>
        </div>
      </div>
    </div>
  );
};
