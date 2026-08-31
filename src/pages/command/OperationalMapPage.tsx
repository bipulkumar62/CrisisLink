import React, { useState } from 'react';
import {
  Map as MapIcon,
  Shield,
  Layers,
  Activity,
  ArrowRight,
  Filter,
  Truck,
  Building2,
  Ambulance,
  Flame,
  AlertOctagon,
  Bot,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { TacticalMap } from '@/src/components/map/TacticalMap';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { MapSkeleton } from '@/src/components/common/SkeletonLoaders';

interface OperationalMapPageProps {
  onNavigate: (route: RoutePath) => void;
  onSelectIncidentDetail: (code: string) => void;
}

export const OperationalMapPage: React.FC<OperationalMapPageProps> = ({
  onNavigate,
  onSelectIncidentDetail,
}) => {
  const { incidents, resources, selectedIncident, setSelectedIncident, isLoading } = useEmergencyData();
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'INCIDENTS' | 'FLEET' | 'SHELTERS'>('ALL');

  if (isLoading) {
    return (
      <div className="p-6 bg-[#F7F8FA] min-h-full">
        <MapSkeleton />
      </div>
    );
  }

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const availableResources = resources.filter((r) => r.status === 'AVAILABLE');

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#F7F8FA]">
      {/* Top Map Header Bar with Layer Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 lg:px-6 py-3 bg-white border-b border-[#D9E0E7] gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
            <MapIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-heading text-sm font-bold text-[#101828]">
              Full-Spectrum Tactical Geospatial Grid — Jaipur, Rajasthan
            </h1>
            <span className="text-[10px] text-[#52606D] font-mono-data">
              Real-time vector coordinates, GIS cordon buffers, and fleet telemetry
            </span>
          </div>
        </div>

        {/* Quick Layer Switchers */}
        <div className="flex items-center gap-2 text-xs font-mono-data overflow-x-auto pb-0.5 flex-nowrap">
          <button
            type="button"
            onClick={() => setActiveLayer('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors whitespace-nowrap ${
              activeLayer === 'ALL'
                ? 'bg-[#0B1F33] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Overlays ({incidents.length + resources.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('INCIDENTS')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
              activeLayer === 'INCIDENTS'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertOctagon className="w-3 h-3" />
            Incidents ({activeIncidents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('FLEET')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
              activeLayer === 'FLEET'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Truck className="w-3 h-3" />
            Fleet ({resources.filter(r => r.type !== 'SHELTER').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('SHELTERS')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
              activeLayer === 'SHELTERS'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3 h-3" />
            Shelters ({resources.filter(r => r.type === 'SHELTER').length})
          </button>
        </div>
      </div>

      {/* Full-bleed tactical map */}
      <div className="flex-1 relative overflow-hidden">
        <TacticalMap
          incidents={activeLayer === 'FLEET' || activeLayer === 'SHELTERS' ? [] : incidents}
          resources={
            activeLayer === 'INCIDENTS'
              ? []
              : activeLayer === 'SHELTERS'
              ? resources.filter((r) => r.type === 'SHELTER')
              : activeLayer === 'FLEET'
              ? resources.filter((r) => r.type !== 'SHELTER')
              : resources
          }
          selectedIncident={selectedIncident}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          fullHeight={true}
        />

        {/* Floating Quick Drawer if incident selected */}
        {selectedIncident && (
          <div className="absolute bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white border border-[#D9E0E7] rounded-xl p-5 shadow-lg z-40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono-data">
                <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {selectedIncident.code}
                </span>
                <StatusBadge severity={selectedIncident.severity} />
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="font-heading text-base font-bold text-[#101828] leading-tight">
                {selectedIncident.title}
              </h3>
              <p className="text-xs text-[#52606D] mt-0.5">{selectedIncident.location.address}</p>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 line-clamp-3">
              {selectedIncident.description}
            </p>

            <div className="flex items-center justify-between text-xs font-mono-data text-slate-600 bg-blue-50/60 p-2 rounded border border-blue-200">
              <div className="flex items-center gap-1 text-blue-900 font-bold">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Confidence: {selectedIncident.priority.confidenceScore}%</span>
              </div>
              <span className="font-bold text-red-600">Score: {selectedIncident.priority.overall}/100</span>
            </div>

            <button
              onClick={() => {
                onSelectIncidentDetail(selectedIncident.code);
                onNavigate('command-incident-detail');
              }}
              className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Open Full Intelligence Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
