import React from 'react';
import { Shield, PhoneCall, Radio, AlertOctagon } from 'lucide-react';
import { RoutePath } from '@/src/config/constants';

interface FooterProps {
  onNavigate: (route: RoutePath) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0b1f33] text-slate-300 border-t border-slate-800 py-12 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1 */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded bg-[#0051d5] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-lg text-white">CrisisLink</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Next-generation Emergency Intelligence & Response Coordination Platform. Connecting citizen eyewitnesses with tactical first responders.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-mono-data">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Operational Gateway Active
          </div>
        </div>

        {/* Col 2 */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Citizen Services
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <button
                onClick={() => onNavigate('citizen-report')}
                className="hover:text-white transition-colors"
              >
                Report an Emergency
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('citizen-live')}
                className="hover:text-white transition-colors"
              >
                Live Public Incidents Map
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('citizen-confirmation')}
                className="hover:text-white transition-colors"
              >
                Track Submitted Report
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('citizen-status')}
                className="hover:text-white transition-colors"
              >
                Emergency Services Status
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            First Responders & CAD
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <button
                onClick={() => onNavigate('command-dashboard')}
                className="hover:text-white transition-colors"
              >
                Command Center Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('command-map')}
                className="hover:text-white transition-colors"
              >
                Tactical Geospatial Grid
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('command-resources')}
                className="hover:text-white transition-colors"
              >
                Fleet & Unit Management
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('command-login')}
                className="hover:text-white transition-colors"
              >
                Operator Switch / Login
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="space-y-3 p-4 bg-slate-900/60 rounded border border-slate-800">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase">
            <AlertOctagon className="w-4 h-4" />
            Immediate Life Hazard?
          </div>
          <p className="text-xs text-slate-400">
            If you or someone else is in immediate physical danger, dial official emergency numbers immediately:
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a
              href="tel:911"
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Dial 911
            </a>
            <button
              onClick={() => onNavigate('citizen-report')}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              Online Triage
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© 2026 CrisisLink Emergency Network. Certified Response Framework.</p>
        <p className="font-mono-data">API Endpoint: /api/v1/incidents • Status: Active</p>
      </div>
    </footer>
  );
};
