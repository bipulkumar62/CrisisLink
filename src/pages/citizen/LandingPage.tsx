import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  Shield,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  PhoneCall,
  Search,
  CheckCircle,
  HelpCircle,
  FileText,
  Compass,
} from 'lucide-react';
import { RoutePath, APP_CONFIG } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { TacticalMap } from '@/src/components/map/TacticalMap';
import { formatRelativeTime } from '@/src/utils/formatters';

interface LandingPageProps {
  onNavigate: (route: RoutePath) => void;
  onSelectIncident: (code: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectIncident }) => {
  const { incidents, resources, telemetry, reports } = useEmergencyData();
  const [tokenInput, setTokenInput] = useState('');
  const [tokenLookupResult, setTokenLookupResult] = useState<{
    found: boolean;
    token?: string;
    status?: string;
    message?: string;
  } | null>(null);

  const activeIncidents = incidents.filter((i) => i.isPubliclyVisible && i.status !== 'RESOLVED');
  const criticalCount = activeIncidents.filter((i) => i.severity === 'CRITICAL').length;

  const handleTokenLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    const clean = tokenInput.trim().toUpperCase();
    const match = reports.find((r) => r.trackingToken.toUpperCase() === clean);

    if (match) {
      setTokenLookupResult({
        found: true,
        token: match.trackingToken,
        status: match.status,
        message: `Report verified. Categorized as ${match.incidentCategory} in ${match.location.neighborhood || 'Jaipur'}. Assigned to live CAD triage.`,
      });
    } else {
      setTokenLookupResult({
        found: false,
        message: `No active report found for token "${clean}". Please verify your reference code or submit a new eyewitness report.`,
      });
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="max-w-4xl space-y-6 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-mono-data font-bold uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {APP_CONFIG.REGION_LABEL}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold shadow-sm">
              <Activity className="w-3.5 h-3.5" />
              {activeIncidents.length} Verified Municipal Incidents
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 font-heading tracking-tight leading-[1.1]">
              Rapid Emergency Intelligence & Response Coordination
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              When disaster strikes, every second matters. CrisisLink fuses eyewitness reports, real-time sensor streams, and AI signal deduplication to deliver instant situational clarity for citizens and first responders across Jaipur.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('citizen-report')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report an Emergency Now</span>
            </button>

            <button
              onClick={() => onNavigate('citizen-live')}
              className="px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Explore Live Incident Grid</span>
            </button>

            <button
              onClick={() => onNavigate('command-login')}
              className="px-4 py-3.5 text-slate-500 hover:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors sm:ml-auto"
            >
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              <span>Operator CAD Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Immediate Hotline Warning Strip */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#D92D20]">
            <div className="flex items-center gap-2 font-medium">
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>Life-threatening emergency? Call national dispatch immediately.</span>
            </div>
            <a
              href={`tel:${APP_CONFIG.HOTLINE_EMERGENCY}`}
              className="font-bold underline uppercase tracking-wider font-mono-data shrink-0"
            >
              Dial 112
            </a>
          </div>
        </div>
      </section>

      {/* Operational Jaipur Map & Live Grid Preview */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              Live Jaipur Operational Grid
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Verified spatial perimeters, evacuation cordons, and active response deployments.
            </p>
          </div>
          <button
            onClick={() => onNavigate('citizen-live')}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline self-start sm:self-auto"
          >
            <span>View Fullscreen Interactive Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Map Preview */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-[#D9E0E7] shadow-xs h-[260px] sm:h-[340px] lg:h-[420px]">
            <TacticalMap
              incidents={activeIncidents}
              resources={resources}
              selectedIncident={activeIncidents[0] || null}
              onSelectIncident={(inc) => {
                onSelectIncident(inc.code);
                onNavigate('citizen-incident-detail');
              }}
            />
          </div>

          {/* Real-time Alert Feed List */}
          <div className="bg-white border border-[#D9E0E7] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D92D20] animate-ping"></span>
                <h3 className="text-xs font-bold text-[#101828] font-heading uppercase tracking-wider">
                  Active Priority Alerts
                </h3>
              </div>
              <span className="text-[11px] font-mono-data text-[#52606D]">
                {activeIncidents.length} In Progress
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
              {activeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => {
                    onSelectIncident(inc.code);
                    onNavigate('citizen-incident-detail');
                  }}
                  className="p-3 bg-[#F7F8FA] border border-[#D9E0E7] rounded-lg hover:border-[#2563EB] hover:bg-blue-50/40 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-data text-xs font-bold text-[#52606D]">
                      {inc.code}
                    </span>
                    <StatusBadge severity={inc.severity} />
                  </div>
                  <h4 className="text-xs font-bold text-[#101828] line-clamp-1">
                    {inc.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-[#52606D] font-mono-data pt-1 border-t border-[#D9E0E7]">
                    <div className="flex items-center gap-1 truncate max-w-[170px]">
                      <MapPin className="w-3 h-3 shrink-0 text-[#2563EB]" />
                      <span className="truncate">{inc.location.sector.split('-')[1] || inc.location.sector}</span>
                    </div>
                    <span>{formatRelativeTime(inc.reportedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The 4-Step Operational Response Architecture Workflow */}
      <section className="bg-white border border-[#D9E0E7] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1">
          <span className="text-[11px] font-bold font-mono-data text-[#2563EB] uppercase tracking-wider">
            Operational Protocol
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101828] font-heading">
            How CrisisLink Coordinates Emergency Ingestion & Dispatch
          </h2>
          <p className="text-xs sm:text-sm text-[#52606D]">
            An end-to-end multi-signal coordination pipeline built for catastrophic communication scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F7F8FA] border border-[#D9E0E7] rounded-lg space-y-2.5">
            <div className="w-8 h-8 rounded bg-[#0B1F33] text-white flex items-center justify-center text-xs font-bold font-mono-data">
              01
            </div>
            <h3 className="text-sm font-bold text-[#101828]">Citizen Ingestion</h3>
            <p className="text-xs text-[#52606D] leading-relaxed">
              Eyewitnesses submit geo-coordinates, photos, voice memos, or text summaries instantly without account barriers or app installation.
            </p>
          </div>

          <div className="p-4 bg-[#F7F8FA] border border-[#D9E0E7] rounded-lg space-y-2.5">
            <div className="w-8 h-8 rounded bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold font-mono-data">
              02
            </div>
            <h3 className="text-sm font-bold text-[#101828]">AI Signal Fusion</h3>
            <p className="text-xs text-[#52606D] leading-relaxed">
              Deduplication algorithms cluster redundant calls, filter hallucinations, analyze damage severity from photos, and cross-reference IoT sensors.
            </p>
          </div>

          <div className="p-4 bg-[#F7F8FA] border border-[#D9E0E7] rounded-lg space-y-2.5">
            <div className="w-8 h-8 rounded bg-[#0B1F33] text-white flex items-center justify-center text-xs font-bold font-mono-data">
              03
            </div>
            <h3 className="text-sm font-bold text-[#101828]">Tactical CAD Dispatch</h3>
            <p className="text-xs text-[#52606D] leading-relaxed">
              Commanders receive structured dossiers with triage scores and deploy optimal rescue units, foam tenders, or medical trauma teams.
            </p>
          </div>

          <div className="p-4 bg-[#F7F8FA] border border-[#D9E0E7] rounded-lg space-y-2.5">
            <div className="w-8 h-8 rounded bg-[#16803A] text-white flex items-center justify-center text-xs font-bold font-mono-data">
              04
            </div>
            <h3 className="text-sm font-bold text-[#101828]">Safety Broadcast</h3>
            <p className="text-xs text-[#52606D] leading-relaxed">
              Real-time evacuation cordons, road blockage warnings, and safe routes are broadcast to the public map, keeping roads clear for ambulances.
            </p>
          </div>
        </div>
      </section>

      {/* Public Service Problem & System Credibility */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: The Real-world Problem */}
        <div className="bg-white border border-[#D9E0E7] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#D92D20]">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold font-heading text-[#101828]">
              The Crisis Communications Breakdown
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#52606D] leading-relaxed">
            During extreme weather events, building collapses, and industrial hazards, traditional 911 / 112 telephone switches become choked with duplicate calls within minutes.
          </p>
          <ul className="space-y-2.5 text-xs text-[#101828]">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20] mt-1.5 shrink-0"></span>
              <span><strong>Overloaded Switchboards:</strong> Dispatchers spend critical minutes answering the same event from hundreds of callers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20] mt-1.5 shrink-0"></span>
              <span><strong>Social Media Misinformation:</strong> Unverified rumors cause panic and route civilian cars into blocked evacuation corridors.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20] mt-1.5 shrink-0"></span>
              <span><strong>Lack of Ground Truth:</strong> First responders deploy without knowing water depth, structural integrity, or toxic gas plumes.</span>
            </li>
          </ul>
        </div>

        {/* Right: CrisisLink Solution Credibility */}
        <div className="bg-white border border-[#D9E0E7] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#2563EB]">
            <Shield className="w-5 h-5" />
            <h3 className="text-base font-bold font-heading text-[#101828]">
              System Integrity & Public Safety Standards
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#52606D] leading-relaxed">
            CrisisLink operates as an auxiliary emergency intelligence mesh adhering to strict municipal security and verification protocols:
          </p>
          <ul className="space-y-2.5 text-xs text-[#101828]">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#16803A] shrink-0 mt-0.5" />
              <span><strong>Zero Friction Ingestion:</strong> Citizens do not need an account or app download to report emergencies.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#16803A] shrink-0 mt-0.5" />
              <span><strong>Strict Reporter Privacy:</strong> Citizen phone numbers and identity data are encrypted and never shown publicly.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#16803A] shrink-0 mt-0.5" />
              <span><strong>Verified Cordons:</strong> Only officially confirmed perimeters and advisories are rendered on the public map.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Tracking Token Lookup Widget */}
      <section className="bg-[#0B1F33] text-white rounded-xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="max-w-2xl space-y-2">
          <span className="text-[11px] font-mono-data font-bold text-blue-400 uppercase tracking-wider">
            Public Inquiry Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Track Existing Emergency Report
          </h2>
          <p className="text-xs text-slate-300">
            Enter the tracking token provided upon report submission (e.g., <code className="font-mono-data text-blue-300">CR-JP-89241</code>) to inspect live dispatch status.
          </p>
        </div>

        <form onSubmit={handleTokenLookup} className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. CR-JP-89241"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono-data text-white placeholder-slate-500 focus:outline-hidden focus:border-[#2563EB]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Verify Token</span>
          </button>
        </form>

        {tokenLookupResult && (
          <div
            className={`p-4 rounded-lg border text-xs max-w-xl space-y-2 ${
              tokenLookupResult.found
                ? 'bg-blue-950/60 border-blue-800 text-blue-100'
                : 'bg-red-950/60 border-red-800 text-red-100'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="font-mono-data">{tokenLookupResult.token || 'Query Result'}</span>
              {tokenLookupResult.found && (
                <span className="px-2 py-0.5 bg-[#16803A] text-white rounded font-mono-data text-[10px]">
                  STATUS: {tokenLookupResult.status}
                </span>
              )}
            </div>
            <p className="leading-relaxed">{tokenLookupResult.message}</p>
            {tokenLookupResult.found && (
              <button
                onClick={() => onNavigate('citizen-confirmation')}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 hover:underline pt-1"
              >
                <span>Open Full Tracking Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
