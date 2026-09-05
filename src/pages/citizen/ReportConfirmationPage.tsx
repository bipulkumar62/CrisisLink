import React, { useState } from 'react';
import {
  CheckCircle,
  Shield,
  Copy,
  Clock,
  Navigation,
  ArrowRight,
  PhoneCall,
  Radio,
  FileCheck,
  Check,
  Bell,
  Camera,
  MapPin,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { RoutePath, APP_CONFIG } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';

interface ReportConfirmationPageProps {
  trackingToken?: string;
  onNavigate: (route: RoutePath) => void;
  onSelectIncident: (code: string) => void;
}

export const ReportConfirmationPage: React.FC<ReportConfirmationPageProps> = ({
  trackingToken = 'CR-JP-89241',
  onNavigate,
  onSelectIncident,
}) => {
  const { reports } = useEmergencyData();
  const [copied, setCopied] = useState(false);
  const [notifySms, setNotifySms] = useState(true);

  const report = reports.find(
    (r) => r.trackingToken && r.trackingToken.toUpperCase() === trackingToken.toUpperCase()
  );


  const handleCopy = () => {
    navigator.clipboard.writeText(trackingToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-3 sm:px-0 space-y-6 pb-24">
      {/* Confirmation Success Header Card */}
      <div
        id="confirmation-card"
        className="bg-white border border-[#D9E0E7] rounded-xl p-6 sm:p-8 text-center space-y-5 shadow-xs"
      >
        <div className="w-14 h-14 bg-emerald-50 text-[#16803A] border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-2xs">
          <CheckCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold font-mono-data text-[#16803A] uppercase tracking-wider">
            Ingestion Confirmed • Jaipur CAD Intake Mesh
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-heading">
            Emergency Report Transmitted
          </h1>
          <p className="text-xs sm:text-sm text-[#52606D] max-w-md mx-auto leading-relaxed">
            Your eyewitness intelligence has been ingested into the local CAD triage queue and relayed to emergency dispatchers.
          </p>
        </div>

        {/* Tracking Token Card */}
        <div className="p-4 bg-[#F7F8FA] border border-[#D9E0E7] rounded-xl max-w-sm mx-auto space-y-2">
          <span className="text-[10px] font-bold text-[#52606D] uppercase tracking-wider block font-mono-data">
            Private Tracking Token Reference
          </span>
          <div className="flex items-center justify-center gap-2">
            <span
              id="report-tracking-token-value"
              className="text-2xl font-bold font-mono-data text-[#2563EB] tracking-wider"
            >
              {trackingToken}
            </span>
            <button
              id="copy-token-btn"
              onClick={handleCopy}
              className="p-2 text-[#52606D] hover:text-[#101828] hover:bg-white rounded-lg border border-transparent hover:border-[#D9E0E7] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Copy token to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-[#16803A]" /> : <Copy className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
          {copied && (
            <span className="text-[10px] text-[#16803A] font-bold block font-mono-data">
              Copied to clipboard! Keep this code for status inquiries.
            </span>
          )}
        </div>

        {/* Submitted Report Summary Card */}
        {report ? (
          <div className="p-4 bg-[#F7F8FA] border border-[#D9E0E7] rounded-xl text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-2">
              <span className="text-xs font-bold text-[#101828] font-heading uppercase tracking-wider">
                Submitted Report Dossier
              </span>
              <StatusBadge severity={report.severitySelfReported} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#52606D]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#101828] block">Location:</span>
                  <span className="text-[11px] leading-tight">{report.location.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#101828] block">Category:</span>
                  <span className="text-[11px] font-mono-data uppercase">{report.incidentCategory}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#101828] block">People Affected:</span>
                  <span className="text-[11px]">
                    {report.reporter.peopleAtRiskCount
                      ? `${report.reporter.peopleAtRiskCount} estimated`
                      : 'Unknown / Unsure'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-[#16803A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#101828] block">Reporter:</span>
                  <span className="text-[11px]">
                    {report.reporter.isAnonymous ? 'Anonymous Eyewitness' : report.reporter.name || 'Citizen'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D9E0E7] space-y-1">
              <span className="text-[10px] font-bold text-[#52606D] uppercase tracking-wider block font-mono-data">
                Eyewitness Description
              </span>
              <p className="text-xs text-[#101828] bg-white p-2.5 rounded-lg border border-[#D9E0E7] leading-relaxed">
                "{report.description}"
              </p>
            </div>

            {report.evidence && report.evidence.length > 0 && (
              <div className="pt-2 border-t border-[#D9E0E7] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-[#101828] font-bold">
                  <Camera className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Attached Evidence Files ({report.evidence.length})</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {report.evidence.map((ev, i) => (
                    <span
                      key={ev.id || i}
                      className="px-2 py-1 bg-white border border-[#D9E0E7] rounded text-[10px] font-mono-data text-[#52606D] flex items-center gap-1"
                    >
                      <span>{ev.name || `Photo #${i + 1}`}</span>
                      {ev.sizeBytes && <span>({(ev.sizeBytes / 1024).toFixed(0)} KB)</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-bold font-mono-data">
              <Shield className="w-4 h-4 text-slate-500" />
              <span>Report Intake Confirmation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your tracking token has been registered in the Jaipur municipal emergency queue. Ingestion and dispatch sync may take a few moments under heavy disaster traffic.
            </p>
          </div>
        )}


        {/* Live Response 4-Stage Pipeline Tracker */}
        <div className="pt-5 border-t border-[#D9E0E7] text-left space-y-4">
          <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
            Live CAD Response Progress Pipeline
          </h4>

          <div className="space-y-3.5">
            {/* Step 1: Ingested */}
            <div className="flex items-start gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#16803A] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                ✓
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-[#101828] block">Report Ingested & Coordinates Validated</span>
                <span className="text-[11px] text-[#52606D]">
                  Location geocoded to Jaipur Municipal Grid. Evidence media queued for CAD triage.
                </span>
              </div>
            </div>

            {/* Step 2: AI Multi-Signal Fusion */}
            <div className="flex items-start gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 animate-pulse">
                2
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-[#101828] block">Multi-Signal Clustering & Deduplication</span>
                <span className="text-[11px] text-[#52606D]">
                  Correlating eyewitness data with municipal water/traffic sensors and surrounding calls.
                </span>
              </div>
            </div>

            {/* Step 3: Tactical Dispatch */}
            <div className="flex items-start gap-3 text-xs opacity-75">
              <div className="w-6 h-6 rounded-full bg-[#0B1F33] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-[#101828] block">Tactical Unit CAD Dispatch</span>
                <span className="text-[11px] text-[#52606D]">
                  Assigned to SDRF Rajasthan / Jaipur Fire Station dispatch console.
                </span>
              </div>
            </div>

            {/* Step 4: First Responders on Scene */}
            <div className="flex items-start gap-3 text-xs opacity-50">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                4
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-[#101828] block">On-Scene Rescue & Perimeter Control</span>
                <span className="text-[11px] text-[#52606D]">
                  Verification cordons published to Live Community Safety Map.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SMS / WhatsApp Updates Toggle */}
        <div className="pt-4 border-t border-[#D9E0E7] flex items-center justify-between p-3 bg-[#F7F8FA] rounded-lg text-xs">
          <div className="flex items-center gap-2 text-[#101828]">
            <Bell className="w-4 h-4 text-[#2563EB]" />
            <span className="font-semibold">Receive SMS perimeter advisory updates</span>
          </div>
          <input
            id="sms-notifications-toggle"
            type="checkbox"
            checked={notifySms}
            onChange={(e) => setNotifySms(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
          />
        </div>
      </div>

      {/* Immediate Citizen Safety Guidance */}
      <div className="bg-[#0B1F33] text-white rounded-xl p-6 space-y-3 text-xs">
        <h3 className="font-bold font-heading text-sm text-white">
          Immediate Safety Advice for Eyewitnesses
        </h3>
        <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
          <li>Remain in a structurally sound location away from rising floodwaters and downed electrical cables.</li>
          <li>If the situation deteriorates or life is in immediate danger, dial <strong className="text-white font-bold">112</strong> immediately.</li>
          <li>Keep access avenues clear for incoming emergency vehicles and ambulances.</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          id="view-live-map-from-confirmation-btn"
          onClick={() => onNavigate('citizen-live')}
          className="w-full sm:flex-1 py-3.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px] touch-manipulation"
        >
          <Navigation className="w-4 h-4" />
          <span>View Live Jaipur Incident Map</span>
        </button>

        <button
          id="submit-another-report-btn"
          onClick={() => onNavigate('citizen-report')}
          className="w-full sm:flex-1 py-3.5 bg-white border border-[#D9E0E7] hover:bg-[#F7F8FA] text-[#101828] font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer min-h-[44px] touch-manipulation"
        >
          Submit Another Report
        </button>

        <button
          id="portal-home-btn"
          onClick={() => onNavigate('citizen-landing')}
          className="w-full sm:w-auto px-5 py-3.5 bg-white border border-[#D9E0E7] hover:bg-[#F7F8FA] text-[#52606D] font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer min-h-[44px] touch-manipulation"
        >
          Portal Home
        </button>
      </div>
    </div>
  );
};
