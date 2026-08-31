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
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { ResourceAssignModal } from '@/src/components/common/ResourceAssignModal';
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
  const { incidents, updateIncidentStatus, resources } = useEmergencyData();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const incident =
    incidents.find((i) => i.code.toLowerCase() === incidentCode.toLowerCase()) || incidents[0];

  if (!incident) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">Incident record not found.</p>
        <button
          onClick={() => onNavigate('command-incidents')}
          className="mt-3 px-4 py-2 bg-[#0051d5] text-white rounded text-xs font-semibold"
        >
          Return to Incidents
        </button>
      </div>
    );
  }

  const assignedUnits = resources.filter((r) => incident.assignedResourceIds.includes(r.id));

  return (
    <div className="space-y-6 pb-16 p-4 lg:p-6 bg-[#fbf9fb] min-h-full">
      {/* Back button */}
      <button
        onClick={() => onNavigate('command-incidents')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Incident Queue
      </button>

      {/* Main Header Card */}
      <div className="bg-white border border-[#c4c6cd]/60 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c4c6cd]/40 pb-4">
          <div className="flex items-center gap-2 font-mono-data">
            <span className="text-base font-bold text-slate-900">{incident.code}</span>
            <StatusBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono-data">Change Status:</span>
            <select
              value={incident.status}
              onChange={(e) => updateIncidentStatus(incident.id, e.target.value as IncidentStatus)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded font-mono-data font-bold bg-white text-slate-800"
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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              {incident.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span>
                {incident.location.address} ({incident.location.sector}) • GPS: [
                {incident.location.latitude.toFixed(4)}, {incident.location.longitude.toFixed(4)}]
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-5 py-2.5 bg-[#0051d5] hover:bg-[#0041ab] text-white rounded text-xs font-bold flex items-center gap-2 transition-colors self-start md:self-auto shadow-xs"
          >
            <Truck className="w-4 h-4" />
            Dispatch & Assign Units
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Intelligence & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Situation Description */}
          <div className="bg-white border border-[#c4c6cd]/60 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-data">
              Operational Situation Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {incident.description}
            </p>
            {incident.publicSummary && (
              <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded text-xs text-blue-950">
                <span className="font-bold block mb-0.5 font-mono-data text-[10px] uppercase text-blue-700">
                  Public Broadcast Advisory:
                </span>
                {incident.publicSummary}
              </div>
            )}
          </div>

          {/* AI Signal Analysis */}
          <div className="bg-white border border-[#c4c6cd]/60 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-data">
                Multi-Signal AI Observation Engine
              </h3>
              <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200 font-mono-data font-bold flex items-center gap-1">
                <Bot className="w-3 h-3" />
                Deduplicated & Fused
              </span>
            </div>

            <div className="space-y-2">
              {incident.signals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded flex items-start gap-3 text-xs"
                >
                  {sig.type === 'CRITICAL_BLOCK' ? (
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  ) : sig.type === 'WARNING' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 flex-1">
                    <div className="flex justify-between items-center text-[10px] font-mono-data text-slate-500">
                      <span className="font-bold text-slate-800">{sig.type.replace('_', ' ')}</span>
                      <span>{sig.timestamp}</span>
                    </div>
                    <p className="text-slate-800">{sig.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono-data block">
                      Source: {sig.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Vault */}
          <div className="bg-white border border-[#c4c6cd]/60 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-data">
              Eyewitness Evidence Vault ({incident.evidence.photoCount} Photos, {incident.evidence.textLogCount} Logs, {incident.evidence.sensorLogCount} Sensor Signals)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono-data">
                  <span className="font-bold text-blue-700">PHOTO CAPTURE</span>
                  <span>10m ago</span>
                </div>
                <p className="text-slate-800 font-medium line-clamp-2">Water surge reaching 3ft depth at main intersection</p>
                <div className="h-20 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
                  <Camera className="w-5 h-5 opacity-50" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono-data">
                  <span className="font-bold text-blue-700">PHOTO CAPTURE</span>
                  <span>14m ago</span>
                </div>
                <p className="text-slate-800 font-medium line-clamp-2">Submerged sedan on 4th & Market</p>
                <div className="h-20 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
                  <Camera className="w-5 h-5 opacity-50" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono-data">
                  <span className="font-bold text-purple-700">TEXT LOG</span>
                  <span>18m ago</span>
                </div>
                <p className="text-slate-800 font-medium line-clamp-2">Citizen audio transcript: 2 elderly citizens on 2nd floor porch</p>
                <div className="h-20 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
                  <FileText className="w-5 h-5 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Priority, Assigned Units, Cordon */}
        <div className="space-y-6">
          {/* Priority Breakdown */}
          <div className="bg-white border border-[#c4c6cd]/60 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-data">
              Algorithmic Severity Score
            </h3>

            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold font-heading text-red-600">
                {incident.priority.overall}
                <span className="text-xs text-slate-400 font-sans font-medium">/100</span>
              </span>
              <span className="text-xs font-bold font-mono-data px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">
                {incident.priority.tier}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600"
                style={{ width: `${incident.priority.overall}%` }}
              />
            </div>

            <div className="divide-y divide-slate-100 text-xs font-mono-data pt-2">
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-500">Life Threat:</span>
                <span className="font-bold text-slate-800">
                  {incident.priority.lifeThreatRisk}
                </span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-500">Infrastructure:</span>
                <span className="font-bold text-red-600">
                  {incident.priority.infrastructureRisk}
                </span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-500">AI Confidence:</span>
                <span className="font-bold text-emerald-700">
                  {incident.priority.aiConfidenceLabel} ({incident.priority.confidenceScore}%)
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Units */}
          <div className="bg-white border border-[#c4c6cd]/60 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-data">
                Assigned Fleet Units ({assignedUnits.length})
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="text-xs font-bold text-[#0051d5] hover:underline"
              >
                + Assign
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
                      <span className="text-[11px] text-slate-500">{u.station}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono-data text-[10px] font-bold rounded border border-blue-200">
                      {u.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No units deployed yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <ResourceAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        incident={incident}
      />
    </div>
  );
};
