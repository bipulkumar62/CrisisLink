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
  Flame,
  Droplets,
  Zap,
  PhoneCall,
  Activity,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { RoutePath, APP_CONFIG } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { TacticalMap } from '@/src/components/map/TacticalMap';
import { SkeletonCard } from '@/src/components/feedback/SkeletonCard';
import { EmptyState } from '@/src/components/feedback/EmptyState';
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
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const filteredIncidents = incidents.filter((inc) => {
    if (!inc.isPubliclyVisible) return false;
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) return false;
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

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & View Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E0E7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D92D20] animate-ping"></span>
            <span className="text-[11px] font-bold font-mono-data text-[#D92D20] uppercase tracking-wider">
              Live Public Citizen Grid • {APP_CONFIG.REGION_LABEL}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-heading">
            Live Emergency Incidents & Safety Perimeters
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Verified ground intelligence, evacuation exclusion cordons, and active response operations across Jaipur.
          </p>
        </div>

        {/* Map / List View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-[#D9E0E7] self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('MAP')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'MAP'
                ? 'bg-[#0B1F33] text-white font-bold'
                : 'text-[#52606D] hover:text-[#101828]'
            }`}
          >
            Tactical Map
          </button>
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'LIST'
                ? 'bg-[#0B1F33] text-white font-bold'
                : 'text-[#52606D] hover:text-[#101828]'
            }`}
          >
            Incident List ({filteredIncidents.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 border border-[#D9E0E7] rounded-xl shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code (e.g. CL-JP-102), road, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F8FA] border border-[#D9E0E7] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] text-[#101828]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 text-xs font-mono-data rounded-lg font-bold border transition-colors whitespace-nowrap cursor-pointer ${
                severityFilter === sev
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#52606D] border-[#D9E0E7] hover:bg-[#F7F8FA]'
              }`}
            >
              {sev}
            </button>
          ))}
          <button
            onClick={handleRefresh}
            title="Refresh Live Data"
            className="p-1.5 bg-white border border-[#D9E0E7] text-[#52606D] hover:text-[#101828] rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading Skeleton View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
        </div>
      ) : filteredIncidents.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Incidents Found"
          description="No emergency incidents match your search or filter parameters in the active Jaipur sector."
          actionLabel="Reset Search & Filters"
          onAction={() => {
            setSearchQuery('');
            setSeverityFilter('ALL');
            setCategoryFilter('ALL');
          }}
        />
      ) : activeTab === 'MAP' ? (
        /* Tactical Interactive Map View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Map Area */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-[#D9E0E7] shadow-xs h-[540px]">
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
              <div className="bg-white border border-[#D9E0E7] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-3">
                  <span className="font-mono-data font-bold text-xs text-[#52606D]">
                    {selectedIncident.code}
                  </span>
                  <StatusBadge severity={selectedIncident.severity} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#101828] font-heading">
                    {selectedIncident.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#52606D]">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span>{selectedIncident.location.address}</span>
                  </div>
                </div>

                <p className="text-xs text-[#52606D] leading-relaxed bg-[#F7F8FA] p-3 rounded-lg border border-[#D9E0E7]">
                  {selectedIncident.publicSummary || selectedIncident.description}
                </p>

                {/* Evacuation perimeter notification */}
                {selectedIncident.evacuationRadiusMeters && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#D92D20] flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#D92D20] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Active Safety Perimeter</span>
                      <span className="text-slate-700">
                        {selectedIncident.evacuationRadiusMeters}m exclusion cordon active. Keep arterial roads open for emergency apparatus.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono-data text-[#52606D] pt-2 border-t border-[#D9E0E7]">
                  <span>Reports: {selectedIncident.reportsAggregatedCount} aggregated</span>
                  <span>Confidence: {selectedIncident.priority.confidenceScore}%</span>
                </div>

                <button
                  onClick={() => {
                    onSelectIncident(selectedIncident.code);
                    onNavigate('citizen-incident-detail');
                  }}
                  className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full Verified Public Dossier</span>
                </button>
              </div>
            ) : (
              <div className="bg-white border border-[#D9E0E7] rounded-xl p-8 text-center text-xs text-[#52606D] space-y-2">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Click any incident pin on the map to inspect safety advisories and verified ground updates.</p>
              </div>
            )}

            {/* Helpline quick card */}
            <div className="bg-[#0B1F33] text-white rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-400 font-bold uppercase">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Jaipur Dispatch Hotline</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                For immediate life danger, dial 112 directly.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Incident Grid List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => {
                onSelectIncident(inc.code);
                onNavigate('citizen-incident-detail');
              }}
              className="bg-white border border-[#D9E0E7] rounded-xl p-5 hover:border-[#2563EB] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data text-xs font-bold text-[#52606D]">
                    {inc.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge severity={inc.severity} />
                    <StatusBadge status={inc.status} />
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#101828] font-heading">
                  {inc.title}
                </h3>

                <p className="text-xs text-[#52606D] line-clamp-2 leading-relaxed">
                  {inc.publicSummary || inc.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#D9E0E7] flex items-center justify-between text-xs text-[#52606D] font-mono-data">
                <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span className="truncate">{inc.location.sector}</span>
                </div>
                <span className="flex items-center gap-1 text-[#2563EB] font-bold">
                  View Dossier <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
