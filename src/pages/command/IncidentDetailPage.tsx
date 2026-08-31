import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  Radio,
  FileText,
  Camera,
  Bot,
  Truck,
  CheckCircle,
  AlertOctagon,
  Zap,
  Volume2,
  Activity,
  Layers,
  Sparkles,
  UserCheck,
  CheckCircle2,
  Users,
  Compass,
  Building2,
  Share2,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { ResourceAssignModal } from '@/src/components/common/ResourceAssignModal';
import { IncidentDetailSkeleton } from '@/src/components/common/SkeletonLoaders';
import { formatRelativeTime } from '@/src/utils/formatters';
import { IncidentStatus } from '@/src/types/incident';

interface IncidentDetailPageProps {
  incidentCode: string;
  onNavigate: (route: RoutePath) => void;
}

export const IncidentDetailPage: React.FC<IncidentDetailPageProps> = ({
  incidentCode,
  onNavigate,
}) => {
  const { incidents, updateIncidentStatus, resources, isLoading } = useEmergencyData();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  if (isLoading) {
    return <IncidentDetailSkeleton />;
  }

  const incident =
    incidents.find((i) => i.code.toLowerCase() === incidentCode.toLowerCase()) || incidents[0];

  if (!incident) {
    return (
      <div className="p-8 text-center bg-[#F7F8FA] min-h-full">
        <p className="text-sm text-slate-500 font-mono-data">Incident record not found for code: {incidentCode}</p>
        <button
          onClick={() => onNavigate('command-incidents')}
          className="mt-3 px-4 py-2 bg-[#0B1F33] text-white rounded text-xs font-bold font-mono-data"
        >
          Return to Incident Queue
        </button>
      </div>
    );
  }

  const assignedUnits = resources.filter((r) => incident.assignedResourceIds.includes(r.id));

  // Default timeline if not set
  const timelineEvents = incident.timeline || [
    {
      id: 'tl-1',
      timestamp: '10:32 AM',
      type: 'INGESTION',
      title: 'Initial Citizen Eyewitness Ingestion',
      description: 'First report CR-JP-89241 submitted with photo evidence.',
      actor: 'Citizen Ingestion Mesh',
    },
    {
      id: 'tl-2',
      timestamp: '10:34 AM',
      type: 'AI_CLUSTERING',
      title: 'AI Multi-Signal Deduplication & Clustering',
      description: 'Multimodal Gemini vision correlated 7 incoming citizen streams into incident cluster.',
      actor: 'AI Ingestion Engine',
    },
    {
      id: 'tl-3',
      timestamp: '10:36 AM',
      type: 'TRIAGE_VERIFIED',
      title: 'CAD Commander Triage Escalation',
      description: 'Severity confirmed as CRITICAL. Cordon boundary authorized.',
      actor: 'Cmdr. Rajesh Rathore',
    },
    {
      id: 'tl-4',
      timestamp: '10:38 AM',
      type: 'DISPATCH',
      title: 'Tactical Resource Dispatch Initiated',
      description: 'First responder units assigned and routed via encrypted telemetry.',
      actor: 'CAD Dispatch Broker',
    },
  ];

  return (
    <div className="space-y-5 pb-16 p-4 lg:p-6 bg-[#F7F8FA] min-h-full">
      {/* Back button and quick breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('command-incidents')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors font-mono-data"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Incident Queue
        </button>
        <span className="hidden sm:inline text-xs font-mono-data text-slate-500">
          Last Synchronized: {formatRelativeTime(incident.updatedAt)}
        </span>
      </div>

      {/* MANDATORY AI OBSERVATION LABEL BANNER */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-950 shadow-xs">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-700 shrink-0" />
          <span className="font-bold">
            AI-assisted observations — Human confirmation recommended
          </span>
        </div>
        <span className="text-[10px] font-mono-data font-semibold text-blue-700 bg-white/70 px-2 py-0.5 rounded border border-blue-200 self-start sm:self-auto">
          Supervised CAD Protocol
        </span>
      </div>

      {/* Main Incident Dossier Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Top Badges & Status Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2.5 font-mono-data">
            <span className="text-base font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {incident.code}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200">
              {incident.category}
            </span>
            <StatusBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono-data font-bold">Status Workflow:</span>
            <select
              value={incident.status}
              onChange={(e) => updateIncidentStatus(incident.id, e.target.value as IncidentStatus)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded font-mono-data font-bold bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="TRIAGED">TRIAGED</option>
              <option value="DISPATCHED">DISPATCHED</option>
              <option value="ON_SCENE">ON SCENE</option>
              <option value="CONTAINED">CONTAINED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>

        {/* Title, Geocoded Coordinates, & Dispatch CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading tracking-tight">
              {incident.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-red-600 font-semibold">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{incident.location.address}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="font-mono-data">Sector: {incident.location.sector}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono-data bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                GPS: [{incident.location.latitude.toFixed(5)}° N, {incident.location.longitude.toFixed(5)}° E]
              </span>
              {incident.location.landmarks && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="italic text-slate-500">Landmarks: {incident.location.landmarks}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center gap-2 transition-colors self-start md:self-auto shadow-sm cursor-pointer active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>Dispatch & Assign Units</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT 2 COLUMNS: Operational Dossier, Signals, Evidence, Corroboration & Timeline */}
        <div className="lg:col-span-2 space-y-5">
          {/* Situation Description & Public Broadcast Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono-data">
                Operational Situation Assessment
              </h3>
              <span className="text-[10px] font-mono-data text-slate-500">
                Evacuation Radius: {incident.evacuationRadiusMeters || 450}m
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
              {incident.description}
            </p>
            {incident.publicSummary && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-950 space-y-1">
                <span className="font-bold block font-mono-data text-[10px] uppercase text-blue-700 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-blue-600" />
                  Public Citizen Safety Broadcast:
                </span>
                <p className="text-blue-900">{incident.publicSummary}</p>
              </div>
            )}
          </div>

          {/* AI-Assisted Observations & Multi-Signal Sensor Fusion */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono-data">
                  AI Observations & Signal Fusion
                </h3>
                <span className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-700 font-mono-data font-bold rounded border border-blue-200 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  AI-assisted
                </span>
              </div>
              <span className="text-[10px] font-mono-data text-slate-500">
                Confidence: {incident.priority.confidenceScore}%
              </span>
            </div>

            <div className="space-y-2">
              {incident.signals.map((sig) => (
                <div
                  key={sig.id}
                  className={`p-3 rounded border flex items-start gap-3 text-xs ${
                    sig.type === 'CRITICAL_BLOCK'
                      ? 'bg-red-50/90 border-red-200 text-red-950'
                      : sig.type === 'WARNING'
                      ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {sig.type === 'CRITICAL_BLOCK' ? (
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  ) : sig.type === 'WARNING' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center text-[10px] font-mono-data">
                      <span className="font-bold uppercase tracking-wider">{sig.type.replace('_', ' ')}</span>
                      <span className="text-slate-500">{sig.timestamp}</span>
                    </div>
                    <p className="font-medium leading-snug">{sig.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono-data block">
                      Source: {sig.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Vault & Citizen Corroboration */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono-data">
                Evidence & Signal Corroboration
              </h3>
              <span className="text-[10px] font-mono-data text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                {incident.corroboration?.score || 96}% Corroboration Score
              </span>
            </div>

            {/* Corroboration Summary Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-700 font-bold font-mono-data">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Multi-Source Cross Validation</span>
              </div>
              <p className="text-slate-600 text-xs">
                {incident.corroboration?.crossValidationNotes ||
                  'Cross-validated with Municipal Water Depth Sensor #JP-FL-04 and CCTV MI Road Traffic Node 08.'}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-[11px] font-mono-data text-slate-600">
                <span>Citizen Reports: <strong>{incident.reportsAggregatedCount}</strong></span>
                <span>Trusted Reporters: <strong>{incident.corroboration?.trustedReporterCount || 6}</strong></span>
                <span>Sensor Confirmation: <strong>{incident.corroboration?.sensorConfirmation !== false ? 'Active & Matched' : 'Pending'}</strong></span>
              </div>
            </div>

            {/* Ingested Evidence Samples */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono-data">
                  <span className="font-bold text-blue-700 flex items-center gap-1">
                    <Camera className="w-3 h-3" /> PHOTO
                  </span>
                  <span>14m ago</span>
                </div>
                <p className="text-slate-800 font-medium line-clamp-2 text-xs">
                  Water surge reaching 3ft depth at Paanch Batti intersection
                </p>
                <div className="h-20 bg-slate-200 rounded flex flex-col items-center justify-center text-slate-500 text-[10px] font-mono-data border border-slate-300">
                  <Camera className="w-5 h-5 text-slate-400 mb-1" />
                  <span>JPG • 2048x1536</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono-data">
                  <span className="font-bold text-blue-700 flex items-center gap-1">
                    <Camera className="w-3 h-3" /> PHOTO
                  </span>
                  <span>18m ago</span>
                </div>
                <p className="text-slate-800 font-medium line-clamp-2 text-xs">
                  Submerged auto-rickshaw trapped in low-lying underpass
                </p>
                <div className="h-20 bg-slate-200 rounded flex flex-col items-center justify-center text-slate-500 text-[10px] font-mono-data border border-slate-300">
                  <Camera className="w-5 h-5 text-slate-400 mb-1" />
                  <span>JPG • Geotag Verified</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono-data">
                  <span className="font-bold text-purple-700 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> AUDIO MEMO
                  </span>
                  <span>22m ago</span>
                </div>
                <p className="text-slate-800 font-medium line-clamp-2 text-xs">
                  "Water entering commercial basement shops rapidly..."
                </p>
                <div className="h-20 bg-slate-200 rounded flex flex-col items-center justify-center text-slate-500 text-[10px] font-mono-data border border-slate-300">
                  <Volume2 className="w-5 h-5 text-slate-400 mb-1" />
                  <span>00:38 Voice Ingest</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Timeline (Chronological Audit Log) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono-data">
                Event Timeline & CAD Audit Trail
              </h3>
              <span className="text-[10px] font-mono-data text-slate-500">
                {timelineEvents.length} Recorded Operations
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineEvents.map((evt, idx) => (
                <div key={evt.id || idx} className="relative space-y-1">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-white"></div>
                  <div className="flex items-center justify-between text-[11px] font-mono-data">
                    <span className="font-bold text-slate-900">{evt.title}</span>
                    <span className="text-slate-500">{evt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700">{evt.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono-data block">
                    Operator / System: {evt.actor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Priority Breakdown, Recommended Resources, Assigned Units */}
        <div className="space-y-5">
          {/* Algorithmic Severity Score Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono-data">
              Algorithmic Severity Score
            </h3>

            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold font-heading text-red-600 leading-none">
                {incident.priority.overall}
                <span className="text-xs text-slate-400 font-sans font-medium">/100</span>
              </span>
              <span className="text-xs font-bold font-mono-data px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">
                {incident.priority.tier}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600"
                style={{ width: `${incident.priority.overall}%` }}
              />
            </div>

            <div className="divide-y divide-slate-100 text-xs font-mono-data pt-1">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Life Threat Risk:</span>
                <span className="font-bold text-slate-900">{incident.priority.lifeThreatRisk}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Infrastructure Risk:</span>
                <span className="font-bold text-red-600">{incident.priority.infrastructureRisk}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Spread Velocity:</span>
                <span className="font-bold text-amber-700">{incident.priority.spreadVelocity || 'Fast'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Vulnerable Persons:</span>
                <span className="font-bold text-slate-900">{incident.priority.vulnerablePopulation || 28} estimated</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">AI Confidence:</span>
                <span className="font-bold text-emerald-700">
                  {incident.priority.aiConfidenceLabel} ({incident.priority.confidenceScore}%)
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Resources */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono-data">
              AI Recommended Resources
            </h3>
            <div className="space-y-2">
              {incident.recommendedResources.map((rec) => (
                <div
                  key={rec.unitId}
                  className="p-2.5 bg-blue-50/50 border border-blue-200 rounded flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <div>
                      <span className="font-bold text-slate-900 block font-mono-data">{rec.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono-data">{rec.type} • ETA ~{rec.etaMinutes} mins</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-data font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Fleet Units */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono-data">
                Active Assigned Fleet ({assignedUnits.length})
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                + Assign Unit
              </button>
            </div>

            {assignedUnits.length > 0 ? (
              <div className="space-y-2">
                {assignedUnits.map((u) => (
                  <div
                    key={u.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono-data font-bold text-slate-900 block">
                        {u.callsign} ({u.type.replace('_', ' ')})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono-data">{u.station}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono-data text-[10px] font-bold rounded border border-blue-200">
                      {u.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic font-mono-data">No tactical units currently assigned.</p>
            )}
          </div>
        </div>
      </div>

      {/* Resource Assignment Modal */}
      <ResourceAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        incident={incident}
      />
    </div>
  );
};
