import React from 'react';
import { Shield, PhoneCall, Radio, AlertOctagon, ExternalLink, MapPin } from 'lucide-react';
import { RoutePath, APP_CONFIG } from '@/src/config/constants';

interface FooterProps {
  onNavigate: (route: RoutePath) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0B1F33] text-slate-300 border-t border-slate-800 py-12 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Identity & Simulation Notice */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-7 h-7 rounded bg-[#2563EB] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-white">CrisisLink</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Emergency Intelligence & Response Coordination Platform. Ingesting multi-channel citizen eyewitness signals and synchronizing tactical first-responder dispatch.
          </p>
          <div className="pt-1 flex flex-col gap-1 text-[11px] font-mono-data text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16803A] animate-pulse"></span>
              <span className="text-[#16803A] font-bold">Jaipur Simulation Hub Active</span>
            </div>
            <span className="text-slate-400">Node: Rajasthan State Disaster Ops</span>
          </div>
        </div>

        {/* Col 2: Citizen Services */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Citizen Emergency Services
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>
              <button
                onClick={() => onNavigate('citizen-report')}
                className="hover:text-white hover:underline transition-colors text-left"
              >
                Report Active Incident
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('citizen-live')}
                className="hover:text-white hover:underline transition-colors text-left"
              >
                Live Jaipur Incidents & Safety Grid
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('citizen-confirmation')}
                className="hover:text-white hover:underline transition-colors text-left"
              >
                Track Incident Report Token
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('citizen-status')}
                className="hover:text-white hover:underline transition-colors text-left"
              >
                System Telemetry & Ingestion Mesh
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Command Center Links */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            First Responder & CAD
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>
              <button
                onClick={() => onNavigate('command-dashboard')}
                className="hover:text-white hover:underline transition-colors text-left"
              >
                Command Center Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('command-map')}
                className="hover:text-white hover:underline transition-colors text-left"
              >
                Geospatial Tactical Grid
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('command-reports')}
                className="hover:text-white hover:underline transition-colors text-left"
              >
                Eyewitness Triage Queue
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('command-resources')}
                className="hover:text-white hover:underline transition-colors text-left"
              >
                Fleet & Unit Allocation
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('command-login')}
                className="hover:text-white hover:underline transition-colors text-left"
              >
                Authorized Personnel Login
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Emergency Helplines Direct Contact */}
        <div className="space-y-3 p-4 bg-[#102a45] rounded border border-slate-700">
          <div className="flex items-center gap-2 text-[#D92D20] text-xs font-bold uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>Immediate Life Hazard</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            If you or someone nearby is in immediate life danger, contact municipal dispatch hotlines immediately:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono-data text-xs">
            <a
              href={`tel:${APP_CONFIG.HOTLINE_EMERGENCY}`}
              className="py-2 px-3 bg-[#D92D20] hover:bg-[#b91c1c] text-white font-bold rounded text-center flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Dial 112
            </a>
            <a
              href={`tel:${APP_CONFIG.HOTLINE_FIRE}`}
              className="py-2 px-3 bg-[#D97706] hover:bg-[#b45309] text-white font-bold rounded text-center flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Fire: 101
            </a>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700 flex justify-between">
            <span>Ambulance: 108</span>
            <span>Disaster: 1070</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <p>© 2026 CrisisLink — {APP_CONFIG.REGION_LABEL}. Built for emergency intelligence.</p>
        <p className="font-mono-data">Multi-Signal CAD Mesh • Protocol v2.0</p>
      </div>
    </footer>
  );
};
