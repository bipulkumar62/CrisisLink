import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { TacticalMap } from '@/src/components/map/TacticalMap';
import { formatRelativeTime } from '@/src/utils/formatters';
import { Incident } from '@/src/types/incident';

interface LiveIncidentsPageProps {
  onNavigate: (route: RoutePath) => void;
  onSelectIncident: (code: string) => void;
}

export const LiveIncidentsPage: React.FC<LiveIncidentsPageProps> = ({
  onNavigate,
  onSelectIncident,
}) => {
  const { incidents, resources, selectedIncident, setSelectedIncident } = useEmergencyData();
  const [activeTab, setActiveTab] = useState<'MAP' | 'LIST'>('MAP');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredIncidents = incidents.filter((inc) => {
    if (!inc.isPubliclyVisible) return false;
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.code.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.location.address.toLowerCase().includes(q) ||
        inc.location.sector.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & View Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            <span className="text-xs font-bold font-mono-data text-red-600 uppercase tracking-wider">
              Live Citizen Advisory Feed
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">
            Live Public Emergency Map & Grid
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial awareness and verified safety perimeters across active municipal sectors.
          </p>
        </div>

        {/* Map / List View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('MAP')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'MAP'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Map
          </button>
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'LIST'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incident List ({filteredIncidents.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code (CL-102), street address, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'ACTIVE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 text-xs font-mono-data rounded font-semibold border transition-colors whitespace-nowrap ${
                severityFilter === sev
                  ? 'bg-[#0051d5] text-white border-[#0051d5]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'MAP' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Map */}
          <div className="lg:col-span-2 rounded-lg overflow-hidden border border-slate-300 shadow-sm h-[520px]">
            <TacticalMap
              incidents={filteredIncidents}
              resources={resources}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
            />
          </div>

          {/* Selected Incident Drawer */}
          <div className="space-y-4">
            {selectedIncident ? (
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-mono-data font-bold text-xs text-slate-500">
                    {selectedIncident.code}
                  </span>
                  <StatusBadge severity={selectedIncident.severity} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    {selectedIncident.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedIncident.location.address}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                  {selectedIncident.publicSummary || selectedIncident.description}
                </p>

                {selectedIncident.evacuationRadiusMeters && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Active Safety Perimeter</span>
                      <span>
                        Cordon established {selectedIncident.evacuationRadiusMeters}m around
                        incident core. Please keep access roads open for first responders.
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    onSelectIncident(selectedIncident.code);
                    onNavigate('citizen-incident-detail');
                  }}
                  className="w-full py-2.5 bg-[#0051d5] hover:bg-[#0041ab] text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Incident Public Briefing
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
                Click any incident pin on the map to inspect safety advisories and verified details.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => {
                onSelectIncident(inc.code);
                onNavigate('citizen-incident-detail');
              }}
              className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data text-xs font-bold text-slate-600">
                    {inc.code}
                  </span>
                  <StatusBadge severity={inc.severity} />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading">{inc.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {inc.publicSummary || inc.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono-data">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{inc.location.sector}</span>
                </div>
                <span className="flex items-center gap-1 text-[#0051d5] font-semibold">
                  Read Detail <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
