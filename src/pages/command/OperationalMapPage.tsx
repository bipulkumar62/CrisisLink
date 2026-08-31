import React from 'react';
import {
  Map as MapIcon,
  Shield,
  Layers,
  Activity,
  ArrowRight,
  Filter,
  Truck,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { TacticalMap } from '@/src/components/map/TacticalMap';
import { StatusBadge } from '@/src/components/common/StatusBadge';

interface OperationalMapPageProps {
  onNavigate: (route: RoutePath) => void;
  onSelectIncidentDetail: (code: string) => void;
}

export const OperationalMapPage: React.FC<OperationalMapPageProps> = ({
  onNavigate,
  onSelectIncidentDetail,
}) => {
  const { incidents, resources, selectedIncident, setSelectedIncident } = useEmergencyData();

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#fbf9fb]">
      {/* Top Map Header Bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-2.5 bg-white border-b border-[#c4c6cd]/60 shrink-0">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-[#0051d5]" />
          <h1 className="font-heading text-sm font-bold text-slate-900">
            Full-Spectrum Tactical Geospatial Grid
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono-data">
          <span className="text-slate-500">
            Tracking {incidents.filter((i) => i.status !== 'RESOLVED').length} Active Incidents •{' '}
            {resources.length} Fleet Units
          </span>
        </div>
      </div>

      {/* Full-bleed tactical map */}
      <div className="flex-1 relative overflow-hidden">
        <TacticalMap
          incidents={incidents}
          resources={resources}
          selectedIncident={selectedIncident}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          fullHeight={true}
        />

        {/* Floating Quick Drawer if incident selected */}
        {selectedIncident && (
          <div className="absolute bottom-6 right-6 w-96 bg-white/95 backdrop-blur-xs border border-[#c4c6cd] rounded-xl p-5 shadow-lg z-40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono-data">
                <span className="font-bold text-xs text-slate-900">{selectedIncident.code}</span>
                <StatusBadge severity={selectedIncident.severity} />
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 leading-tight">
                {selectedIncident.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedIncident.location.address}</p>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 line-clamp-3">
              {selectedIncident.description}
            </p>

            <button
              onClick={() => {
                onSelectIncidentDetail(selectedIncident.code);
                onNavigate('command-incident-detail');
              }}
              className="w-full py-2 bg-[#0051d5] hover:bg-[#0041ab] text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              Open Full Intelligence Dossier
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
