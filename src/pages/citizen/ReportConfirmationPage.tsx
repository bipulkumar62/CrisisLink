import React from 'react';
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
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';

interface ReportConfirmationPageProps {
  trackingToken?: string;
  onNavigate: (route: RoutePath) => void;
  onSelectIncident: (code: string) => void;
}

export const ReportConfirmationPage: React.FC<ReportConfirmationPageProps> = ({
  trackingToken = 'CR-89241',
  onNavigate,
  onSelectIncident,
}) => {
  const { reports, incidents } = useEmergencyData();
  const [copied, setCopied] = React.useState(false);

  const report =
    reports.find((r) => r.trackingToken.toUpperCase() === trackingToken.toUpperCase()) || reports[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Success Badge Banner */}
      <div className="bg-white border border-emerald-200 rounded-xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold font-mono-data text-emerald-700 uppercase tracking-wider">
            Transmission Confirmed & Queued
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Emergency Report Transmitted
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your eyewitness intelligence has been ingested into the CrisisLink Operational Hub and
            relayed to first responder CAD dispatch.
          </p>
        </div>

        {/* Tracking Token Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-w-sm mx-auto space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Your Private Tracking Token
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold font-mono-data text-[#0051d5] tracking-wider">
              {trackingToken}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
              title="Copy token"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && (
            <span className="text-[10px] text-emerald-600 font-bold block">
              Copied to clipboard!
            </span>
          )}
        </div>

        {/* Live Dispatch Pipeline Stage */}
        <div className="pt-4 border-t border-slate-100 text-left space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Live Response Progress
          </h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Report Ingested</span>
                <span className="text-[11px] text-slate-500">
                  Geo-coordinates and media validated.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                2
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  AI Severity & Signal Fusion
                </span>
                <span className="text-[11px] text-slate-500">
                  Clustered into active Sector 7 response plan.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs opacity-60">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                3
              </div>
              <div>
                <span className="font-bold text-slate-700 block">First Responders on Scene</span>
                <span className="text-[11px] text-slate-500">Tactical unit ETA 4 mins.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Instructions */}
      <div className="bg-slate-900 text-white rounded-xl p-6 space-y-3 text-xs">
        <h3 className="font-bold font-heading text-sm text-white">Important Citizen Safety Guidance</h3>
        <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
          <li>Stay in a secure location if it is safe to do so.</li>
          <li>If immediate life danger escalates, call 911 immediately without waiting.</li>
          <li>Do not attempt to cross flooded roadways or downed powerlines.</li>
        </ul>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => onNavigate('citizen-live')}
          className="w-full sm:flex-1 py-3 bg-[#0051d5] hover:bg-[#0041ab] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          View Live Incident Sector Map
        </button>

        <button
          onClick={() => onNavigate('citizen-landing')}
          className="w-full sm:flex-1 py-3 bg-white border border-slate-300 text-slate-800 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-colors text-center"
        >
          Return to Portal Home
        </button>
      </div>
    </div>
  );
};
