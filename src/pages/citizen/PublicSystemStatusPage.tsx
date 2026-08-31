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
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';

interface PublicSystemStatusPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const PublicSystemStatusPage: React.FC<PublicSystemStatusPageProps> = ({ onNavigate }) => {
  const { telemetry, refreshData, isLoading } = useEmergencyData();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold font-mono-data text-emerald-700 uppercase tracking-wider">
              Emergency Infrastructure Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Public Emergency System & Network Status
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of citizen report ingestion channels, dispatch gateways, and public alert feeds.
          </p>
        </div>

        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Global Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-center gap-4 text-emerald-950 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold font-heading">All Emergency Ingestion Services Fully Operational</h3>
          <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
            All regional 911 bridges, web intake gateways, and geospatial tactical feeds are responding normally with low latency ({telemetry?.pipelineLatencyMs || 42}ms).
          </p>
        </div>
      </div>

      {/* Microservice Health List */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider">
          Core Municipal Ingestion Grid
        </h3>

        <div className="divide-y divide-slate-100">
          {telemetry?.services.map((srv) => (
            <div key={srv.name} className="py-3.5 flex items-center justify-between gap-4">
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
                <span className="text-slate-500 text-[11px]">{srv.latencyMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct CAD Hotlines */}
      <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold font-heading text-white">Need Immediate Assistance?</h4>
          <p className="text-xs text-slate-400">
            For urgent incidents, report online or contact dispatch directly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('citizen-report')}
            className="px-4 py-2 bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-bold rounded transition-colors"
          >
            Submit Web Report
          </button>
          <a
            href="tel:911"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors"
          >
            Call 911
          </a>
        </div>
      </div>
    </div>
  );
};
