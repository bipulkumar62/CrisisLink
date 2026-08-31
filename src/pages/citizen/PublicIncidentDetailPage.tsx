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
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
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
  const { incidents } = useEmergencyData();
  const incident =
    incidents.find((i) => i.code.toLowerCase() === incidentCode.toLowerCase()) || incidents[0];

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Incident not found.</p>
        <button
          onClick={() => onNavigate('citizen-live')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold"
        >
          Return to Live Map
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back link */}
      <button
        onClick={() => onNavigate('citizen-live')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Live Incidents Grid
      </button>

      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 font-mono-data">
            <span className="text-sm font-bold text-slate-600">{incident.code}</span>
            <StatusBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          <span className="text-xs text-slate-500 font-mono-data">
            First Logged: {formatRelativeTime(incident.reportedAt)}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            {incident.title}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>{incident.location.address} ({incident.location.sector})</span>
          </div>
        </div>

        {/* Public Summary banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Verified Situation Assessment
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {incident.publicSummary || incident.description}
          </p>
        </div>
      </div>

      {/* Safety & Evacuation Directives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Evacuation Alert Card */}
          {incident.evacuationRadiusMeters ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-red-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-800 text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Active Safety Cordon Established ({incident.evacuationRadiusMeters}m)
              </div>
              <p className="text-xs text-red-900 leading-relaxed">
                Emergency services have secured an exclusion perimeter around the incident zone.
                Please yield right-of-way to flashing emergency apparatus and refrain from driving
                towards the sector.
              </p>
            </div>
          ) : null}

          {/* Timeline / Incident Signals */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider">
              Emergency Operations Timeline & Signals
            </h3>

            <div className="space-y-3">
              {incident.signals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono-data text-slate-500">
                    <span className="font-bold text-blue-700">{sig.type.replace('_', ' ')}</span>
                    <span>{sig.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">{sig.message}</p>
                  <span className="text-[10px] text-slate-400 block">{sig.source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Key Numbers & Actions */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 font-heading uppercase tracking-wider">
              Citizen Advisory Actions
            </h3>

            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Keep telephone lines free for critical 911 calls.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Monitor local emergency radio and CrisisLink broadcast feed.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>If trapped, signal first responders with light or high-visibility cloth.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => onNavigate('citizen-report')}
                className="w-full py-2.5 bg-[#0051d5] hover:bg-[#0041ab] text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Provide Eyewitness Update
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-lg p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-bold uppercase">
              <PhoneCall className="w-4 h-4" />
              Direct CAD Hotline
            </div>
            <p className="text-slate-300">
              For trapped victims or medical emergencies in this sector, contact dispatchers directly:
            </p>
            <a
              href="tel:911"
              className="block w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-center rounded transition-colors"
            >
              Dial 911 Direct
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
