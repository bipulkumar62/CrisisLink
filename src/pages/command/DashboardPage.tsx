import React, { useState } from 'react';
import {
  Filter,
  Clock,
  MapPin,
  MoreVertical,
  Camera,
  FileText,
  Bot,
  AlertOctagon,
  AlertTriangle,
  Zap,
  ArrowRight,
  Shield,
  Activity,
  Truck,
  Building2,
  Ambulance,
  Flame,
  Radio,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { TacticalMap } from '@/src/components/map/TacticalMap';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { ResourceAssignModal } from '@/src/components/common/ResourceAssignModal';
import { DashboardSkeleton } from '@/src/components/common/SkeletonLoaders';
import { formatRelativeTime } from '@/src/utils/formatters';
import { Incident } from '@/src/types/incident';

interface DashboardPageProps {
  onNavigate: (route: RoutePath) => void;
  onSelectIncidentDetail: (code: string) => void;
}

type MobileViewTab = 'overview' | 'map' | 'incidents' | 'resources';

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectIncidentDetail,
}) => {
  const {
    incidents,
    selectedIncident,
    setSelectedIncident,
    resources,
    stats,
    isLoading,
    refreshData,
  } = useEmergencyData();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [filterActiveOnly, setFilterActiveOnly] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileViewTab>('overview');
  const [isSimulatingReload, setIsSimulatingReload] = useState(false);

  const handleSimulateReload = async () => {
    setIsSimulatingReload(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    await refreshData();
    setIsSimulatingReload(false);
  };

  if (isLoading || isSimulatingReload) {
    return <DashboardSkeleton />;
  }

  const activeIncidents = incidents.filter((i) =>
    filterActiveOnly ? i.status !== 'RESOLVED' : true
  );

  const currentIncident = selectedIncident || activeIncidents[0] || incidents[0];

  // Resource breakdown counts
  const availableAmbulances = resources.filter((r) => r.type === 'AMBULANCE' && r.status === 'AVAILABLE').length;
  const totalAmbulances = resources.filter((r) => r.type === 'AMBULANCE').length;
  const availableRescue = resources.filter((r) => r.type === 'RESCUE_TEAM' && r.status === 'AVAILABLE').length;
  const totalRescue = resources.filter((r) => r.type === 'RESCUE_TEAM').length;
  const availableFire = resources.filter((r) => (r.type === 'FIRE_UNIT' || r.type === 'FIRE_ENGINE') && r.status === 'AVAILABLE').length;
  const totalFire = resources.filter((r) => r.type === 'FIRE_UNIT' || r.type === 'FIRE_ENGINE').length;
  const availableShelters = resources.filter((r) => r.type === 'SHELTER' && r.status === 'AVAILABLE').length;
  const totalShelters = resources.filter((r) => r.type === 'SHELTER').length;

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#F7F8FA]">
      {/* Top 5 Metrics Row (Desktop & Tablet) */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-2.5 bg-white border-b border-[#D9E0E7] shrink-0 overflow-x-auto">
        <div className="flex items-center gap-4 lg:gap-6 min-w-max">
          {/* Critical Incidents */}
          <div className="flex items-center gap-2.5 pr-4 lg:pr-6 border-r border-[#D9E0E7]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D92D20] animate-pulse"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-[#52606D] uppercase font-mono-data">
                Critical Incidents
              </span>
              <span className="font-heading text-lg lg:text-xl font-bold text-[#D92D20] leading-tight">
                {stats.criticalCount}
              </span>
            </div>
          </div>

          {/* High Priority */}
          <div className="flex items-center gap-2.5 pr-4 lg:pr-6 border-r border-[#D9E0E7]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-[#52606D] uppercase font-mono-data">
                High Priority
              </span>
              <span className="font-heading text-lg lg:text-xl font-bold text-[#D97706] leading-tight">
                {stats.highCount}
              </span>
            </div>
          </div>

          {/* Active Incidents */}
          <div className="flex items-center gap-2.5 pr-4 lg:pr-6 border-r border-[#D9E0E7]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-[#52606D] uppercase font-mono-data">
                Active Incidents
              </span>
              <span className="font-heading text-lg lg:text-xl font-bold text-[#2563EB] leading-tight">
                {stats.activeCount}
              </span>
            </div>
          </div>

          {/* Available Resources */}
          <div className="flex items-center gap-2.5 pr-4 lg:pr-6 border-r border-[#D9E0E7]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#16803A]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-[#52606D] uppercase font-mono-data">
                Available Resources
              </span>
              <span className="font-heading text-lg lg:text-xl font-bold text-[#16803A] leading-tight">
                {stats.availableCount}
              </span>
            </div>
          </div>

          {/* Resolved Today */}
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-[#52606D] uppercase font-mono-data">
                Resolved Today
              </span>
              <span className="font-heading text-lg lg:text-xl font-bold text-[#101828] leading-tight">
                {stats.resolvedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Live CAD Status & Simulate Reload */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={handleSimulateReload}
            title="Reload telemetry data"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono-data text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync Feed</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-mono-data text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-[#D9E0E7]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Jaipur Mesh Connected</span>
          </div>
        </div>
      </div>

      {/* MOBILE SPECIFIC NAVIGATION (Distinct mobile tabs: Overview, Map, Incidents, Resources) */}
      <div className="lg:hidden flex bg-[#0B1F33] text-white border-b border-slate-700 shrink-0">
        <button
          onClick={() => setMobileTab('overview')}
          className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
            mobileTab === 'overview'
              ? 'border-blue-400 text-white bg-white/10'
              : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
            mobileTab === 'map'
              ? 'border-blue-400 text-white bg-white/10'
              : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMobileTab('incidents')}
          className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
            mobileTab === 'incidents'
              ? 'border-blue-400 text-white bg-white/10'
              : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          Incidents ({activeIncidents.length})
        </button>
        <button
          onClick={() => setMobileTab('resources')}
          className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
            mobileTab === 'resources'
              ? 'border-blue-400 text-white bg-white/10'
              : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          Resources
        </button>
      </div>

      {/* 3-Column CAD Layout for Desktop / Tablet */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: Active Incident Queue & Resource Quick Bar */}
        <div
          className={`w-full lg:w-80 shrink-0 bg-white border-r border-[#D9E0E7] flex flex-col overflow-hidden ${
            mobileTab === 'incidents' || mobileTab === 'overview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Header */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase font-mono-data">
                Active Queue ({activeIncidents.length})
              </h3>
            </div>
            <button
              onClick={() => setFilterActiveOnly((v) => !v)}
              title="Toggle active only filter"
              className="text-[#52606D] hover:text-[#101828] p-1 rounded hover:bg-slate-200 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Incident Queue List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#D9E0E7] bg-white">
            {activeIncidents.map((inc) => {
              const isSelected = currentIncident?.id === inc.id;

              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncident(inc);
                    if (window.innerWidth < 1024) {
                      setMobileTab('overview');
                    }
                  }}
                  className={`p-3 relative cursor-pointer transition-colors border-l-4 ${
                    isSelected
                      ? 'bg-slate-100 border-l-blue-600'
                      : 'bg-white hover:bg-slate-50 border-l-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 ml-1">
                    <span
                      className={`font-mono-data text-[11px] font-bold ${
                        isSelected ? 'text-blue-700' : 'text-slate-600'
                      }`}
                    >
                      {inc.code}
                    </span>
                    <StatusBadge severity={inc.severity} />
                  </div>

                  <h4
                    className={`text-sm font-bold ml-1 leading-tight mb-2 ${
                      isSelected ? 'text-slate-900' : 'text-slate-800'
                    }`}
                  >
                    {inc.title}
                  </h4>

                  <div className="flex items-center justify-between mt-2 ml-1 text-[10px] font-mono-data">
                    <div className="flex items-center gap-1.5">
                      <Clock
                        className={`w-3 h-3 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}
                      />
                      <span className={isSelected ? 'text-blue-700' : 'text-slate-500'}>
                        {formatRelativeTime(inc.reportedAt)}
                      </span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        inc.priority.overall >= 80 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : inc.priority.overall >= 60 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {inc.priority.overall}/100 Risk
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Resource Summary in Left Footer */}
          <div className="p-3 border-t border-[#D9E0E7] bg-slate-50 shrink-0 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono-data font-bold text-slate-700 uppercase">
              <span>Fleet Availability</span>
              <button
                onClick={() => onNavigate('command-resources')}
                className="text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono-data">
              <div className="bg-white border border-slate-200 px-2 py-1 rounded flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600">
                  <Ambulance className="w-3 h-3 text-red-500" /> EMS:
                </span>
                <span className="font-bold text-slate-900">{availableAmbulances}/{totalAmbulances}</span>
              </div>
              <div className="bg-white border border-slate-200 px-2 py-1 rounded flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600">
                  <Shield className="w-3 h-3 text-amber-500" /> Rescue:
                </span>
                <span className="font-bold text-slate-900">{availableRescue}/{totalRescue}</span>
              </div>
              <div className="bg-white border border-slate-200 px-2 py-1 rounded flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600">
                  <Flame className="w-3 h-3 text-orange-500" /> Fire:
                </span>
                <span className="font-bold text-slate-900">{availableFire}/{totalFire}</span>
              </div>
              <div className="bg-white border border-slate-200 px-2 py-1 rounded flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600">
                  <Building2 className="w-3 h-3 text-emerald-600" /> Shelter:
                </span>
                <span className="font-bold text-slate-900">{availableShelters}/{totalShelters}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Operational Jaipur Map & Operational Events Bar */}
        <div
          className={`flex-1 flex flex-col relative overflow-hidden bg-[#e9e5df] min-h-[380px] lg:min-h-0 ${
            mobileTab === 'map' || mobileTab === 'overview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Tactical Map Container */}
          <div className="flex-1 relative">
            <TacticalMap
              incidents={activeIncidents}
              resources={resources}
              selectedIncident={currentIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
            />
          </div>

          {/* Bottom Operational Events Stream / CAD Dispatch Ledger */}
          <div className="h-28 bg-[#0B1F33] text-white border-t border-slate-700 shrink-0 flex flex-col overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-700/60 flex items-center justify-between text-[10px] font-mono-data">
              <span className="font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Live Dispatch Stream & Operational Events
              </span>
              <span className="text-slate-400">Jaipur District CAD Mesh</span>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-1.5 space-y-1 text-xs font-mono-data">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-blue-400 font-bold">10:48 AM</span>
                <span className="px-1.5 py-0.2 bg-red-950 text-red-300 border border-red-800 rounded text-[9px]">CL-JP-102</span>
                <span>SDRF-02 deploying rescue rafts at Ajmeri Gate sector. 8 evacuees assisted.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-blue-400 font-bold">10:45 AM</span>
                <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[9px]">CL-JP-105</span>
                <span>FIRE-01 on-scene at VKIA chemical godown. Containment foam line established.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-blue-400 font-bold">10:41 AM</span>
                <span className="px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-800 rounded text-[9px]">SHELTER-01</span>
                <span>SMS Stadium shelter activated: 42 evacuees admitted, rations distributed.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Incident Panel */}
        {currentIncident && (
          <div
            className={`w-full lg:w-[380px] shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col overflow-hidden shadow-lg z-20 ${
              mobileTab === 'overview' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Sticky Panel Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-2 shrink-0 shadow-sm z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono-data text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                      {currentIncident.code}
                    </span>
                    <StatusBadge severity={currentIncident.severity} />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-slate-900 leading-snug">
                    {currentIncident.title}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    onSelectIncidentDetail(currentIncident.code);
                    onNavigate('command-incident-detail');
                  }}
                  title="Full deep-dive view"
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-white transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-medium">{currentIncident.location.address}</span>
              </div>
            </div>

            {/* Panel Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-white">
              {/* Intelligence Overview Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#F7F8FA] p-2.5 border border-[#D9E0E7] rounded flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-[#52606D] uppercase font-mono-data">
                    Reports Aggregated
                  </span>
                  <span className="font-mono-data text-lg font-bold text-[#101828]">
                    {currentIncident.reportsAggregatedCount} citizen reports
                  </span>
                </div>

                <div className="bg-[#F7F8FA] p-2.5 border border-[#D9E0E7] rounded flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-[#52606D] uppercase font-mono-data">
                    AI Confidence
                  </span>
                  <span className="font-mono-data text-lg font-bold text-[#16803A]">
                    {currentIncident.priority.aiConfidenceLabel} ({currentIncident.priority.confidenceScore}%)
                  </span>
                </div>

                {/* Evidence Processed */}
                <div className="bg-[#F7F8FA] p-2.5 border border-[#D9E0E7] rounded col-span-2 flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-[#52606D] uppercase font-mono-data">
                      Evidence Ingested
                    </span>
                    <div className="flex gap-3 text-xs font-mono-data font-semibold text-[#101828]">
                      <div className="flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>{currentIncident.evidence.photoCount} Photos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>{currentIncident.evidence.textLogCount} Logs</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectIncidentDetail(currentIncident.code);
                      onNavigate('command-incident-detail');
                    }}
                    className="text-[#2563EB] hover:text-blue-800 text-xs font-bold flex items-center gap-1"
                  >
                    <span>Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Priority Score Breakdown */}
              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase font-mono-data tracking-widest border-b border-slate-100 pb-1">
                  System Priority Assessment
                </h3>
                <div className="border border-slate-200 rounded-md p-3 bg-slate-50 flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <span className="font-heading text-3xl font-bold text-slate-900 leading-none">
                      {currentIncident.priority.overall}
                      <span className="text-sm text-slate-400 font-sans font-medium">/100</span>
                    </span>
                    <span className={`text-[10px] font-bold uppercase font-mono-data px-2 py-1 rounded border ${
                      currentIncident.priority.overall >= 80 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : currentIncident.priority.overall >= 60 
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {currentIncident.priority.tier}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className={`h-full transition-all duration-500 ${
                        currentIncident.priority.overall >= 80 ? 'bg-red-600' : currentIncident.priority.overall >= 60 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${currentIncident.priority.overall}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] font-mono-data pt-2 border-t border-slate-200">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Life Threat</span>
                      <span className={`font-bold ${currentIncident.priority.lifeThreatRisk === 'Severe' || currentIncident.priority.lifeThreatRisk === 'High' ? 'text-red-600' : 'text-slate-900'}`}>
                        {currentIncident.priority.lifeThreatRisk}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Infrastructure</span>
                      <span className={`font-bold ${currentIncident.priority.infrastructureRisk === 'Severe' || currentIncident.priority.infrastructureRisk === 'High' ? 'text-red-600' : 'text-slate-900'}`}>
                        {currentIncident.priority.infrastructureRisk}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI-Assisted Observations Clearly Labeled */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase font-mono-data tracking-widest">
                    Machine Intelligence
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 flex items-center gap-1 font-semibold">
                    <Bot className="w-3 h-3" />
                    AI Aggregated
                  </span>
                </div>

                <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-md text-[11px] text-amber-900 leading-snug font-medium flex gap-2 items-start">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>AI-assisted observations require human operator verification before dispatch.</span>
                </div>

                <div className="flex flex-col gap-1.5 border border-slate-200 rounded-md bg-slate-50 p-2 shadow-sm">
                  {currentIncident.signals.map((sig) => (
                    <div
                      key={sig.id}
                      className={`flex items-start gap-2 p-2 rounded-md text-xs leading-tight ${
                        sig.type === 'CRITICAL_BLOCK'
                          ? 'bg-red-50 text-red-900 border border-red-100'
                          : 'bg-white text-slate-800 border border-slate-100 shadow-sm'
                      }`}
                    >
                      {sig.type === 'CRITICAL_BLOCK' ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      ) : sig.type === 'WARNING' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <span>{sig.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 border-t border-slate-200 bg-white shrink-0 flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono-data tracking-widest">
                  System Recommended Units
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentIncident.recommendedResources.map((rec) => (
                    <span
                      key={rec.unitId}
                      className="font-mono-data text-[10px] px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md flex items-center gap-1.5 font-semibold"
                    >
                      <Shield className="w-3 h-3 text-slate-500" />
                      {rec.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <Truck className="w-4 h-4" />
                  <span>Dispatch Resource</span>
                </button>
                <button
                  onClick={() => {
                    onSelectIncidentDetail(currentIncident.code);
                    onNavigate('command-incident-detail');
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Detail</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resource Assignment Modal */}
      {currentIncident && (
        <ResourceAssignModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          incident={currentIncident}
        />
      )}
    </div>
  );
};
