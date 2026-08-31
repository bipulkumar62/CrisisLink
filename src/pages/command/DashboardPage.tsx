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
  HeartPulse,
  Truck,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { TacticalMap } from '@/src/components/map/TacticalMap';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { ResourceAssignModal } from '@/src/components/common/ResourceAssignModal';
import { formatRelativeTime } from '@/src/utils/formatters';
import { Incident } from '@/src/types/incident';

interface DashboardPageProps {
  onNavigate: (route: RoutePath) => void;
  onSelectIncidentDetail: (code: string) => void;
}

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
  } = useEmergencyData();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [filterActiveOnly, setFilterActiveOnly] = useState(true);

  const activeIncidents = incidents.filter((i) =>
    filterActiveOnly ? i.status !== 'RESOLVED' : true
  );

  const currentIncident = selectedIncident || activeIncidents[0] || incidents[0];

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#fbf9fb]">
      {/* Top Metrics Row */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-2.5 bg-[#fbf9fb] border-b border-[#c4c6cd]/60 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-4 lg:gap-6 min-w-max">
          {/* Critical */}
          <div className="flex items-center gap-2 pr-4 lg:pr-6 border-r border-[#c4c6cd]/40">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wider text-[#74777d] uppercase">
                Critical
              </span>
              <span className="font-heading text-lg lg:text-xl font-bold text-[#ba1a1a] leading-tight">
                {stats.criticalCount}
              </span>
            </div>
          </div>

          {/* High */}
          <div className="flex items-center gap-2 pr-4 lg:pr-6 border-r border-[#c4c6cd]/40">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wider text-[#74777d] uppercase">
                High
              </span>
              <span className="font-heading text-lg lg:text-xl font-bold text-[#d97706] leading-tight">
                {stats.highCount}
              </span>
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-2 pr-4 lg:pr-6 border-r border-[#c4c6cd]/40">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0051d5]"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wider text-[#74777d] uppercase">
                Active
              </span>
              <span className="font-heading text-lg lg:text-xl font-bold text-[#0051d5] leading-tight">
                {stats.activeCount}
              </span>
            </div>
          </div>

          {/* Available */}
          <div className="flex items-center gap-2 pr-4 lg:pr-6 border-r border-[#c4c6cd]/40">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wider text-[#74777d] uppercase">
                Available
              </span>
              <span className="font-heading text-lg lg:text-xl font-bold text-[#059669] leading-tight">
                {stats.availableCount}
              </span>
            </div>
          </div>

          {/* Resolved */}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#74777d]"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wider text-[#74777d] uppercase">
                Resolved
              </span>
              <span className="font-heading text-lg lg:text-xl font-bold text-[#1b1c1d] leading-tight">
                {stats.resolvedCount}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono-data text-[#44474c]">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>CAD Gateway Linked</span>
        </div>
      </div>

      {/* 3-Column Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: Active Incidents Queue */}
        <div className="w-full lg:w-80 shrink-0 bg-[#fbf9fb] border-r border-[#c4c6cd]/60 flex flex-col overflow-hidden max-h-60 lg:max-h-full">
          {/* Header */}
          <div className="p-3 border-b border-[#c4c6cd]/60 bg-white flex items-center justify-between shrink-0">
            <h3 className="text-xs font-bold tracking-wider text-[#1b1c1d] uppercase font-mono-data">
              Active Incidents ({activeIncidents.length})
            </h3>
            <button
              onClick={() => setFilterActiveOnly((v) => !v)}
              title="Toggle filter"
              className="text-[#44474c] hover:text-[#00050e] p-1 rounded hover:bg-slate-100 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto bg-[#fbf9fb] divide-y divide-[#c4c6cd]/30">
            {activeIncidents.map((inc) => {
              const isSelected = currentIncident?.id === inc.id;

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 relative cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0b1f33] text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-[#1b1c1d]'
                  }`}
                >
                  {/* Left accent indicator bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-r ${
                      isSelected
                        ? 'bg-[#0051d5]'
                        : inc.severity === 'CRITICAL'
                        ? 'bg-[#ba1a1a]'
                        : inc.severity === 'HIGH'
                        ? 'bg-[#f59e0b]'
                        : 'bg-transparent'
                    }`}
                  />

                  <div className="flex justify-between items-start mb-1 ml-2">
                    <span
                      className={`font-mono-data text-xs font-bold ${
                        isSelected ? 'text-blue-300' : 'text-[#44474c]'
                      }`}
                    >
                      {inc.code}
                    </span>
                    <StatusBadge severity={inc.severity} />
                  </div>

                  <h4
                    className={`text-xs font-bold ml-2 leading-tight ${
                      isSelected ? 'text-white' : 'text-[#1b1c1d]'
                    }`}
                  >
                    {inc.title}
                  </h4>

                  <div className="flex items-center gap-2 mt-2 ml-2 text-[11px] font-mono-data">
                    <Clock
                      className={`w-3 h-3 ${isSelected ? 'text-slate-400' : 'text-[#74777d]'}`}
                    />
                    <span className={isSelected ? 'text-slate-400' : 'text-[#74777d]'}>
                      {formatRelativeTime(inc.reportedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: Operational Tactical Map */}
        <div className="flex-1 relative overflow-hidden bg-[#e9e5df] min-h-[350px] lg:min-h-0">
          <TacticalMap
            incidents={activeIncidents}
            resources={resources}
            selectedIncident={currentIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        </div>

        {/* RIGHT COLUMN: Incident Intelligence Panel */}
        {currentIncident && (
          <div className="w-full lg:w-96 shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-[#c4c6cd]/60 flex flex-col overflow-hidden shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)] z-20 max-h-[50vh] lg:max-h-full">
            {/* Panel Header */}
            <div className="p-4 border-b border-[#c4c6cd]/60 bg-white flex flex-col gap-2 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono-data text-xs font-bold text-[#44474c]">
                      {currentIncident.code}
                    </span>
                    <StatusBadge severity={currentIncident.severity} />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-[#1b1c1d] leading-snug">
                    {currentIncident.title}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    onSelectIncidentDetail(currentIncident.code);
                    onNavigate('command-incident-detail');
                  }}
                  title="Full deep-dive view"
                  className="p-1 text-[#74777d] hover:text-[#00050e] rounded hover:bg-slate-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[#44474c] text-xs">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">{currentIncident.location.address}</span>
              </div>
            </div>

            {/* Panel Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-white">
              {/* Intelligence Overview Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#fbf9fb] p-3 border border-[#c4c6cd]/60 rounded flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-[#74777d] uppercase font-mono-data">
                    Reports Aggregated
                  </span>
                  <span className="font-mono-data text-xl font-bold text-[#1b1c1d]">
                    {currentIncident.reportsAggregatedCount}
                  </span>
                </div>

                <div className="bg-[#fbf9fb] p-3 border border-[#c4c6cd]/60 rounded flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-[#74777d] uppercase font-mono-data">
                    AI Confidence
                  </span>
                  <span className="font-mono-data text-xl font-bold text-[#059669]">
                    {currentIncident.priority.aiConfidenceLabel}
                  </span>
                </div>

                {/* Evidence Processed */}
                <div className="bg-[#fbf9fb] p-3 border border-[#c4c6cd]/60 rounded col-span-2 flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#74777d] uppercase font-mono-data">
                      Evidence Processed
                    </span>
                    <div className="flex gap-4 text-xs font-mono-data font-semibold text-[#1b1c1d]">
                      <div className="flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-[#0051d5]" />
                        <span>{currentIncident.evidence.photoCount} Photos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#0051d5]" />
                        <span>{currentIncident.evidence.textLogCount} Text logs</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectIncidentDetail(currentIncident.code);
                      onNavigate('command-incident-detail');
                    }}
                    className="text-[#0051d5] hover:text-[#0041ab] text-xs font-bold underline"
                  >
                    View All
                  </button>
                </div>
              </div>

              {/* Incident Signals (AI) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#1b1c1d] uppercase font-mono-data tracking-wider">
                    Incident Signals
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-[#0051d5] rounded border border-blue-200 flex items-center gap-1 font-semibold">
                    <Bot className="w-3 h-3" />
                    AI-Assisted Observations
                  </span>
                </div>

                <div className="flex flex-col gap-2 border border-[#c4c6cd]/60 rounded bg-white p-2">
                  {currentIncident.signals.map((sig) => (
                    <div
                      key={sig.id}
                      className={`flex items-start gap-2 p-2 rounded text-xs leading-tight ${
                        sig.type === 'CRITICAL_BLOCK'
                          ? 'bg-red-50/80 text-red-950 border border-red-200/60'
                          : 'bg-slate-50 text-slate-800 border border-slate-200/60'
                      }`}
                    >
                      {sig.type === 'CRITICAL_BLOCK' ? (
                        <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      ) : sig.type === 'WARNING' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      )}
                      <span>{sig.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Score Breakdown */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-[#1b1c1d] uppercase font-mono-data tracking-wider">
                  Priority Score Breakdown
                </h3>
                <div className="border border-[#c4c6cd]/60 rounded p-3 bg-white flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <span className="font-heading text-3xl font-bold text-[#ba1a1a] leading-none">
                      {currentIncident.priority.overall}
                      <span className="text-xs text-[#74777d] font-sans font-medium">/100</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#ba1a1a] uppercase font-mono-data bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {currentIncident.priority.tier}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-[#ba1a1a]"
                      style={{ width: `${currentIncident.priority.overall}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-data pt-1 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[#44474c]">
                      <span>Life Threat Risk</span>
                      <span className="font-bold text-[#1b1c1d]">
                        {currentIncident.priority.lifeThreatRisk}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#44474c]">
                      <span>Infrastructure</span>
                      <span className="font-bold text-[#ba1a1a]">
                        {currentIncident.priority.infrastructureRisk}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 border-t border-[#c4c6cd]/60 bg-white shrink-0 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-[#74777d] uppercase font-mono-data">
                  Recommended Response Package
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentIncident.recommendedResources.map((rec) => (
                    <span
                      key={rec.unitId}
                      className="font-mono-data text-[11px] px-2 py-1 bg-blue-50 border border-blue-200 text-[#0051d5] rounded flex items-center gap-1 font-semibold"
                    >
                      <Shield className="w-3 h-3 text-[#0051d5]" />
                      {rec.name}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="w-full py-2.5 bg-[#0051d5] hover:bg-[#0041ab] text-white rounded transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-98"
              >
                <span>Assign & Dispatch Resources</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
