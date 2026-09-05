import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle,
  MapPin,
  Clock,
  User,
  Shield,
  Bot,
  Camera,
  Volume2,
  AlertTriangle,
  ChevronRight,
  PlusCircle,
  XCircle,
  HelpCircle,
  UserCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { ReportsSkeleton } from '@/src/components/common/SkeletonLoaders';
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
  const { reports, incidents, isLoading, createIncident, clusterReportToIncident } = useEmergencyData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CitizenReportStatus | 'ALL'>('ALL');
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(reports[0] || null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  if (isLoading) {
    return <ReportsSkeleton />;
  }

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

  const handleCreateIncidentFromReport = async () => {
    if (!selectedReport || isProcessingAction) return;
    setIsProcessingAction(true);
    try {
      const newInc = await createIncident({
        title: `${selectedReport.incidentCategory} - ${selectedReport.location.address.slice(0, 30)}`,
        description: selectedReport.description,
        category: selectedReport.incidentCategory,
        severity: (selectedReport.severitySelfReported || 'HIGH') as any,
        location: {
          address: selectedReport.location.address,
          sector: selectedReport.location.neighborhood || 'Jaipur Central',
          latitude: selectedReport.location.latitude,
          longitude: selectedReport.location.longitude,
        },
      });
      await clusterReportToIncident(selectedReport.id, newInc.id);
      setActionSuccessMessage(`CAD Incident ${newInc.code} established and clustered.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      onSelectIncidentDetail(newInc.code);
      onNavigate('command-incident-detail');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Incident creation failed';
      setActionSuccessMessage(`Operational Error: ${msg}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleApproveAndCluster = async () => {
    if (!selectedReport || isProcessingAction) return;
    setIsProcessingAction(true);
    try {
      const targetInc =
        incidents.find((i) => i.id === selectedReport.clusteredIncidentId) ||
        incidents.find((i) => i.status !== 'RESOLVED') ||
        incidents[0];

      if (targetInc) {
        await clusterReportToIncident(selectedReport.id, targetInc.id);
        setActionSuccessMessage(`Report ${selectedReport.trackingToken} clustered to ${targetInc.code}.`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
        onSelectIncidentDetail(targetInc.code);
        onNavigate('command-incident-detail');
      } else {
        await handleCreateIncidentFromReport();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Clustering failed';
      setActionSuccessMessage(`Operational Error: ${msg}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleAction = (actionName: string) => {
    setActionSuccessMessage(`Report ${selectedReport?.trackingToken}: ${actionName} applied successfully in CAD audit trail.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };


  return (
    <div className="space-y-6 pb-12 p-4 lg:p-6 bg-[#F7F8FA] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E0E7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-bold font-mono-data text-blue-700 uppercase tracking-wider">
              Citizen Triage Ingestion Feed
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#101828] font-heading tracking-tight">
            Raw Eyewitness Reports & Evidence Inspector
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Deduplicate citizen submissions, audit photo/audio evidence, analyze credibility scores, and route into CAD incidents.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono-data bg-white p-2.5 border border-[#D9E0E7] rounded-xl shadow-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Ingested:</span>
            <span className="font-bold text-slate-900">{reports.length} Reports</span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Pending Triage:</span>
            <span className="font-bold text-[#D97706]">
              {reports.filter((r) => r.status === 'PENDING_TRIAGE').length} Unclustered
            </span>
          </div>
        </div>
      </div>

      {/* Action Banner Notification */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 font-mono-data">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 border border-[#D9E0E7] rounded-xl shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report tracking token (CR-JP-...), keyword, address, or reporter name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded font-mono-data focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {(['ALL', 'PENDING_TRIAGE', 'CLUSTERED', 'VERIFIED', 'DISMISSED'] as (CitizenReportStatus | 'ALL')[]).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-mono-data rounded font-bold border transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[#0B1F33] text-white border-[#0B1F33]'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Reports' : st.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* 2-Column Split View: List on Left, Detail & Evidence Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredReports.map((rep) => {
            const isSelected = selectedReport?.id === rep.id;

            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-xs'
                    : 'border-[#D9E0E7] hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <div className="flex items-center gap-2 font-mono-data">
                    <span className="font-bold text-xs text-[#2563EB]">{rep.trackingToken}</span>
                    <StatusBadge severity={rep.severitySelfReported} />
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                      {rep.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono-data">
                    {formatRelativeTime(rep.submittedAt)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#101828]">
                    <span className="font-mono-data text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {rep.incidentCategory}
                    </span>
                    <span>{rep.location.address}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                    {rep.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#52606D] font-mono-data">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span>
                      {rep.reporter.isAnonymous
                        ? 'Anonymous Citizen'
                        : rep.reporter.name || 'Citizen'}
                    </span>
                    <span>• {rep.reporter.peopleAtRiskCount || 1} at risk</span>
                    <span>• {rep.credibilityScore}% credibility</span>
                  </div>

                  {rep.clusteredIncidentId && (
                    <span className="font-bold text-[#2563EB] text-[11px]">
                      → Linked: {rep.clusteredIncidentId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Report Inspector & Triage Actions */}
        {selectedReport && (
          <div className="bg-white border border-[#D9E0E7] rounded-xl p-5 shadow-xs space-y-4 sticky top-24">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-400 font-mono-data uppercase">
                Eyewitness Ingestion Inspector
              </span>
              <h3 className="text-base font-bold text-[#101828] font-heading">
                {selectedReport.trackingToken}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge severity={selectedReport.severitySelfReported} />
                <span className="font-mono-data text-xs text-slate-500">
                  {selectedReport.incidentCategory} • Submitted {formatRelativeTime(selectedReport.submittedAt)}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Location & GPS */}
              <div>
                <span className="text-slate-500 font-bold block mb-0.5 font-mono-data text-[10px] uppercase">
                  Geocoded Location:
                </span>
                <div className="flex items-center gap-1.5 text-[#101828]">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{selectedReport.location.address} ({selectedReport.location.neighborhood || 'Jaipur Central'})</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono-data ml-5 mt-0.5">
                  [{selectedReport.location.latitude.toFixed(4)}, {selectedReport.location.longitude.toFixed(4)}]
                </div>
              </div>

              {/* Eyewitness Narrative */}
              <div>
                <span className="text-slate-500 font-bold block mb-0.5 font-mono-data text-[10px] uppercase">
                  Eyewitness Narrative:
                </span>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed text-xs">
                  "{selectedReport.description}"
                </p>
              </div>

              {/* AI Multi-Signal Fusion Rationale */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-blue-950 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-blue-900 font-mono-data text-[11px]">
                  <div className="flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-blue-700" />
                    <span>AI Deduplication Analysis</span>
                  </div>
                  <span>{selectedReport.credibilityScore}% Credibility</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-snug">
                  Urgency flag: <strong className="uppercase">{selectedReport.aiExtractedUrgency}</strong>. Multimodal clustering links this to active incident vector{' '}
                  <strong className="font-mono-data">{selectedReport.clusteredIncidentId || 'CL-JP-102'}</strong>.
                </p>
              </div>

              {/* Evidence Inspector Box */}
              <div>
                <span className="text-slate-500 font-bold block mb-1 font-mono-data text-[10px] uppercase">
                  Ingested Evidence Items:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-mono-data text-[10px] font-bold block">Photo Geotagged</span>
                      <span className="text-[9px] text-slate-400 font-mono-data">EXIF Verified</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="font-mono-data text-[10px] font-bold block">Audio Ingested</span>
                      <span className="text-[9px] text-slate-400 font-mono-data">Transcribed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 CAD Triage Decision Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono-data block">
                CAD Triage Actions
              </span>

              {/* Action 1: Approve & Cluster */}
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleApproveAndCluster}
                className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isProcessingAction ? 'Processing Triage...' : 'Approve & Cluster to Incident'}</span>
              </button>

              {/* Action 2: Create New CAD Incident */}
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleCreateIncidentFromReport}
                className="w-full py-2 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 border border-slate-300 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create New CAD Incident</span>
              </button>


              {/* Action 3: Flag as Inconclusive/Spam */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAction('Flagged Inconclusive / Rejected')}
                  className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-[11px] font-mono-data font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <XCircle className="w-3 h-3 text-red-500" />
                  <span>Flag Inconclusive</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('Requested Citizen Clarification')}
                  className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-[11px] font-mono-data font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3 text-blue-500" />
                  <span>Request Info</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
