import React from 'react';
import {
  AlertTriangle,
  Radio,
  MapPin,
  CheckCircle,
  PhoneCall,
  Search,
  Sparkles,
  ArrowRight,
  Droplets,
  Flame,
  Zap,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { formatRelativeTime } from '@/src/utils/formatters';

interface LandingPageProps {
  onNavigate: (route: RoutePath) => void;
  onSelectIncident: (code: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectIncident }) => {
  const { incidents, stats } = useEmergencyData();
  const [searchToken, setSearchToken] = React.useState('');

  const publicIncidents = incidents.filter((i) => i.isPubliclyVisible && i.status !== 'RESOLVED');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchToken.trim()) {
      onNavigate('citizen-confirmation');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#0b1f33] to-[#081524] text-white p-6 sm:p-10 lg:p-12 shadow-md">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            Unified Citizen Crisis Ingestion Active
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading leading-tight">
            Emergency Intelligence & Response Coordination
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Report crises directly to regional first responder command in real time. CrisisLink
            aggregates eyewitness evidence, auto-triages severity, and dispatches tactical rescue
            teams rapidly.
          </p>

          {/* Direct CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('citizen-report')}
              className="px-5 py-3 bg-[#0051d5] hover:bg-[#0041ab] text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40 text-sm active:scale-98"
            >
              <AlertTriangle className="w-4 h-4" />
              Report an Emergency Now
            </button>

            <button
              onClick={() => onNavigate('citizen-live')}
              className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold rounded-lg transition-all flex items-center gap-2 text-sm backdrop-blur-xs"
            >
              <MapPin className="w-4 h-4 text-blue-400" />
              View Live Incidents Grid
            </button>
          </div>
        </div>

        {/* Live Broadcast Pill stats */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono-data">
          <div>
            <span className="text-slate-400 block">Active Critical</span>
            <span className="text-xl font-bold text-red-400">{stats.criticalCount} Incidents</span>
          </div>
          <div>
            <span className="text-slate-400 block">High Priority</span>
            <span className="text-xl font-bold text-amber-400">{stats.highCount} Incidents</span>
          </div>
          <div>
            <span className="text-slate-400 block">Units Deployed</span>
            <span className="text-xl font-bold text-blue-400">{stats.activeCount} Units</span>
          </div>
          <div>
            <span className="text-slate-400 block">Response Time Avg</span>
            <span className="text-xl font-bold text-emerald-400">4.8 min</span>
          </div>
        </div>
      </section>

      {/* Emergency Report Tracking Banner */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#0051d5] rounded-lg">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Have a Report Tracking Token?
            </h3>
            <p className="text-xs text-slate-500">
              Check real-time dispatch progress, assigned responder units, and status updates.
            </p>
          </div>
        </div>

        <form onSubmit={handleTrackSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="e.g. CR-89241"
            value={searchToken}
            onChange={(e) => setSearchToken(e.target.value)}
            className="px-3.5 py-2 text-xs border border-slate-300 rounded font-mono-data focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full md:w-48 uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Track Status
          </button>
        </form>
      </section>

      {/* Live Public Alerts Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Active Public Emergency Advisories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified ongoing incidents verified by the Emergency Operations Center.
            </p>
          </div>
          <button
            onClick={() => onNavigate('citizen-live')}
            className="text-xs font-semibold text-[#0051d5] hover:text-[#0041ab] flex items-center gap-1"
          >
            All Live Incidents
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicIncidents.slice(0, 3).map((inc) => (
            <div
              key={inc.id}
              onClick={() => {
                onSelectIncident(inc.code);
                onNavigate('citizen-incident-detail');
              }}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
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
                  <span className="truncate max-w-[140px]">{inc.location.sector}</span>
                </div>
                <span>{formatRelativeTime(inc.reportedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How CrisisLink Works */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-100 text-[#0051d5] rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Zero Delay Dispatch
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">
            How CrisisLink Coordinates Response
          </h2>
          <p className="text-xs text-slate-500">
            Engineered for catastrophic conditions, multi-channel citizen intake, and automated
            intelligence clustering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-3">
            <div className="w-9 h-9 bg-blue-50 text-[#0051d5] rounded flex items-center justify-center font-bold font-mono-data text-sm">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm font-heading">
              Eyewitness Ingestion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens submit geo-tagged incident reports with photo and voice evidence without
              creating accounts.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-3">
            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded flex items-center justify-center font-bold font-mono-data text-sm">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm font-heading">
              AI Multi-Signal Fusion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dozens of incoming reports are deduplicated, cross-referenced with IoT sensors, and
              scored for life-threat priority.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-3">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center font-bold font-mono-data text-sm">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm font-heading">
              Tactical Fleet Dispatch
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Command Center operators allocate nearest specialized rescue teams and broadcast
              real-time evacuation safe zones.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Hotline Direct Access */}
      <section className="bg-red-50 border border-red-200 rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-red-950">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600 text-white rounded-lg">
            <PhoneCall className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading">Official Emergency Contact Hub</h3>
            <p className="text-xs text-red-800">
              For immediate active danger to human life, contact local authorities directly:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="tel:911"
            className="flex-1 sm:flex-none px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-colors text-center shadow-xs"
          >
            Call 911 Direct
          </a>
          <a
            href="tel:311"
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-red-300 text-red-900 font-semibold text-xs rounded hover:bg-red-100 transition-colors text-center"
          >
            Call 311 Non-Emergency
          </a>
        </div>
      </section>
    </div>
  );
};
