import React from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  Radio,
  Share2,
  PhoneCall,
  CheckCircle,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { RoutePath, APP_CONFIG } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { formatRelativeTime } from '@/src/utils/formatters';

interface PublicIncidentDetailPageProps {
  incidentCode: string;
  onNavigate: (route: RoutePath) => void;
}

export const PublicIncidentDetailPage: React.FC<PublicIncidentDetailPageProps> = ({
  incidentCode,
  onNavigate,
}) => {
  const { incidents, resources } = useEmergencyData();
  const incident =
    incidents.find((i) => i.code.toLowerCase() === incidentCode.toLowerCase()) || incidents[0];

  if (!incident) {
    return (
      <div className="text-center py-16 bg-white border border-[#D9E0E7] rounded-xl p-8 space-y-4">
        <p className="text-sm text-[#52606D]">Incident record not found in active grid.</p>
        <button
          onClick={() => onNavigate('citizen-live')}
          className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-bold"
        >
          Return to Live Incidents Grid
        </button>
      </div>
    );
  }

  // Assigned resources details (public unit types only, safe from operational compromise)
  const assignedUnits = resources.filter((r) => r.assignedIncidentId === incident.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-2 sm:px-0">
      {/* Back button */}
      <button
        onClick={() => onNavigate('citizen-live')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52606D] hover:text-[#101828] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Live Jaipur Incidents Grid</span>
      </button>

      {/* Incident Header Dossier Card */}
      <div className="bg-white border border-[#D9E0E7] rounded-xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9E0E7] pb-4">
          <div className="flex items-center gap-2 font-mono-data">
            <span className="text-sm font-bold text-[#101828]">{incident.code}</span>
            <StatusBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          <span className="text-xs text-[#52606D] font-mono-data">
            Logged: {formatRelativeTime(incident.reportedAt)} • Jaipur CAD Mesh
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-heading">
            {incident.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#52606D] font-medium">
            <MapPin className="w-4 h-4 text-[#D92D20] shrink-0" />
            <span>{incident.location.address} ({incident.location.sector})</span>
          </div>
        </div>

        {/* Verified Situation Assessment Notice */}
        <div className="p-4 bg-[#F7F8FA] border border-[#D9E0E7] rounded-lg space-y-1.5">
          <div className="flex items-center gap-2 text-[#101828] font-bold text-xs uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Verified Situation Assessment</span>
          </div>
          <p className="text-xs sm:text-sm text-[#52606D] leading-relaxed">
            {incident.publicSummary || incident.description}
          </p>
        </div>
      </div>

      {/* Evacuation & Safety Signals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Active Safety Perimeter Warning */}
          {incident.evacuationRadiusMeters ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-[#D92D20] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Active Safety Perimeter Cordon ({incident.evacuationRadiusMeters} meters)</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed">
                Emergency services have established an exclusion perimeter around the incident zone. Please yield right-of-way to flashing emergency apparatus and keep access roads open.
              </p>
            </div>
          ) : null}

          {/* Operational Timeline & Verified Signals */}
          <div className="bg-white border border-[#D9E0E7] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-3">
              <h3 className="text-sm font-bold text-[#101828] font-heading uppercase tracking-wider">
                Emergency Timeline & Ground Signals
              </h3>
              <span className="text-[11px] font-mono-data text-[#52606D]">
                {incident.signals.length} Verified Broadcasts
              </span>
            </div>

            <div className="space-y-3">
              {incident.signals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3.5 bg-[#F7F8FA] rounded-lg border border-[#D9E0E7] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono-data">
                    <span className="font-bold text-[#2563EB]">{sig.type.replace('_', ' ')}</span>
                    <span className="text-[#52606D]">{sig.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#101828] leading-relaxed">{sig.message}</p>
                  <span className="text-[10px] text-[#52606D] font-mono-data block">Source: {sig.source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned First Responder Summary */}
          {assignedUnits.length > 0 && (
            <div className="bg-white border border-[#D9E0E7] rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Deployed Public Safety Units on Scene
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {assignedUnits.map((u) => (
                  <div
                    key={u.id}
                    className="p-2.5 bg-[#F7F8FA] border border-[#D9E0E7] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#101828] block">{u.name}</span>
                      <span className="text-[11px] text-[#52606D] font-mono-data">{u.station}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-[#16803A] border border-emerald-200 rounded text-[10px] font-mono-data font-bold">
                      {u.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Citizen Safety Actions & Hotline */}
        <div className="space-y-4">
          <div className="bg-white border border-[#D9E0E7] rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-[#101828] uppercase tracking-wider">
              Citizen Advisory Guidelines
            </h3>

            <ul className="space-y-2.5 text-[#52606D]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#16803A] shrink-0 mt-0.5" />
                <span>Keep telephone lines free for life-threatening emergencies.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#16803A] shrink-0 mt-0.5" />
                <span>Do not attempt to cross flooded intersections or downed wires.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#16803A] shrink-0 mt-0.5" />
                <span>Monitor this live CrisisLink advisory feed for perimeter updates.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-[#D9E0E7] space-y-2">
              <button
                onClick={() => onNavigate('citizen-report')}
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Provide Eyewitness Update</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0B1F33] text-white rounded-xl p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-bold uppercase">
              <PhoneCall className="w-4 h-4" />
              <span>Direct Jaipur CAD Helpline</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              If you are trapped or need urgent medical rescue in this sector:
            </p>
            <a
              href={`tel:${APP_CONFIG.HOTLINE_EMERGENCY}`}
              className="block w-full py-2.5 bg-[#D92D20] hover:bg-red-700 text-white font-bold text-center rounded-lg transition-colors font-mono-data"
            >
              Dial 112 (National Emergency)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
