import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle,
  MapPin,
  Clock,
  User,
  Shield,
  Sparkles,
  Layers,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { formatRelativeTime } from '@/src/utils/formatters';
import { CitizenReport, CitizenReportStatus } from '@/src/types/report';

interface ReportsPageProps {
  onNavigate: (route: RoutePath) => void;
  onSelectIncidentDetail: (code: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  onNavigate,
  onSelectIncidentDetail,
}) => {
  const { reports } = useEmergencyData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CitizenReportStatus | 'ALL'>('ALL');
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(reports[0] || null);

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.trackingToken.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.address.toLowerCase().includes(q) ||
        (r.reporter.name && r.reporter.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 p-4 lg:p-6 bg-[#fbf9fb] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c4c6cd]/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span className="text-xs font-bold font-mono-data text-purple-700 uppercase tracking-wider">
              Citizen Triage Ingestion Feed
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#00050e] font-heading">
            Raw Eyewitness Report Triage Queue
          </h1>
          <p className="text-xs text-[#74777d] mt-0.5">
            Deduplicate eyewitness submissions, verify multimedia captures, and cluster reports into active incidents.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-data bg-white p-2 border border-[#c4c6cd]/60 rounded">
          <span className="text-slate-500">Pending Triage:</span>
          <span className="font-bold text-amber-600">
            {reports.filter((r) => r.status === 'PENDING_TRIAGE').length} Reports
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 border border-[#c4c6cd]/60 rounded-lg shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report tracking token, keyword, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['ALL', 'PENDING_TRIAGE', 'CLUSTERED', 'VERIFIED', 'DISMISSED'] as (CitizenReportStatus | 'ALL')[]).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-mono-data rounded font-semibold border transition-colors ${
                  statusFilter === st
                    ? 'bg-[#0051d5] text-white border-[#0051d5]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* 2-Column Split View: List on Left, Detail & Triage Action on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredReports.map((rep) => {
            const isSelected = selectedReport?.id === rep.id;

            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#0051d5] ring-2 ring-[#0051d5]/20 shadow-xs'
                    : 'border-[#c4c6cd]/60 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <div className="flex items-center gap-2 font-mono-data">
                    <span className="font-bold text-xs text-[#0051d5]">{rep.trackingToken}</span>
                    <StatusBadge severity={rep.severitySelfReported} />
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                      {rep.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono-data">
                    {formatRelativeTime(rep.submittedAt)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="font-mono-data text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      {rep.incidentCategory}
                    </span>
                    <span>{rep.location.address}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {rep.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono-data">
                  <div className="flex items-center gap-3">
                    <span>
                      {rep.reporter.isAnonymous
                        ? 'Anonymous Citizen'
                        : rep.reporter.name || 'Citizen'}
                    </span>
                    <span>• {rep.reporter.peopleAtRiskCount || 1} at risk</span>
                    <span>• {rep.evidence.length} evidence items</span>
                  </div>

                  {rep.clusteredIncidentId && (
                    <span className="font-bold text-blue-600">
                      → Merged with {rep.clusteredIncidentId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Report Inspector & Action Bar */}
        {selectedReport && (
          <div className="bg-white border border-[#c4c6cd]/60 rounded-xl p-5 shadow-xs space-y-4 sticky top-24">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-400 font-mono-data uppercase">
                Eyewitness Ingestion Inspector
              </span>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {selectedReport.trackingToken}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge severity={selectedReport.severitySelfReported} />
                <span className="font-mono-data text-xs text-slate-500">
                  {selectedReport.incidentCategory}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold block mb-0.5">Location:</span>
                <div className="flex items-center gap-1 text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{selectedReport.location.address}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-0.5">Eyewitness Narrative:</span>
                <p className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 leading-relaxed">
                  {selectedReport.description}
                </p>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded text-purple-950 space-y-1">
                <div className="flex items-center gap-1 font-bold text-purple-800">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Multi-Signal Fusion ({selectedReport.credibilityScore}% credibility)
                </div>
                <p className="text-[11px] text-purple-900">
                  Urgency flag: <span className="font-bold">{selectedReport.aiExtractedUrgency}</span>. Suggested merge with active incident{' '}
                  <span className="font-bold font-mono-data">
                    {selectedReport.clusteredIncidentId || 'CL-102'}
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Triage Decision Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono-data block">
                CAD Triage Action
              </span>

              <button
                onClick={() => {
                  onSelectIncidentDetail(selectedReport.clusteredIncidentId || 'CL-102');
                  onNavigate('command-incident-detail');
                }}
                className="w-full py-2 bg-[#0051d5] hover:bg-[#0041ab] text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Cluster & Open Incident Dossier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
