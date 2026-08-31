import React from 'react';
import { Shield, Bell, Settings, AlertTriangle, Radio } from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { useAuth } from '@/src/context/AuthContext';

interface TopNavBarProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ currentRoute, onNavigate }) => {
  const { telemetry } = useEmergencyData();
  const { user } = useAuth();
  const isCommandView = currentRoute.startsWith('command-');

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-6 h-16 bg-[#fbf9fb] border-b border-[#c4c6cd]/50">
      {/* Brand & Left Nav */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('citizen-landing')}
          className="flex items-center gap-2 text-left group cursor-pointer focus:outline-hidden"
        >
          <div className="w-8 h-8 rounded bg-[#0b1f33] flex items-center justify-center text-white shadow-xs group-hover:bg-[#0051d5] transition-colors">
            <Shield className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="font-heading text-lg font-bold tracking-tight text-[#00050e] leading-none block">
              CrisisLink
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#74777d] block">
              Intelligence Grid
            </span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[#c4c6cd]/40 h-8">
          <button
            onClick={() => onNavigate('citizen-landing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              currentRoute === 'citizen-landing'
                ? 'text-[#0051d5] bg-blue-50/80 font-bold'
                : 'text-[#44474c] hover:text-[#00050e] hover:bg-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('citizen-live')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              currentRoute === 'citizen-live'
                ? 'text-[#0051d5] bg-blue-50/80 font-bold border-b-2 border-[#0051d5]'
                : 'text-[#44474c] hover:text-[#00050e] hover:bg-slate-100'
            }`}
          >
            Live Incidents
          </button>
          <button
            onClick={() => onNavigate('command-resources')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              currentRoute === 'command-resources'
                ? 'text-[#0051d5] bg-blue-50/80 font-bold'
                : 'text-[#44474c] hover:text-[#00050e] hover:bg-slate-100'
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => onNavigate('citizen-status')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              currentRoute === 'citizen-status'
                ? 'text-[#0051d5] bg-blue-50/80 font-bold'
                : 'text-[#44474c] hover:text-[#00050e] hover:bg-slate-100'
            }`}
          >
            System Status
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#e4e2e4]/70 rounded-full border border-[#c4c6cd]/50 text-xs font-mono-data text-[#44474c]">
          <span className="w-2 h-2 rounded-full bg-[#0051d5] animate-pulse"></span>
          <span>Operations Online</span>
          <span className="w-px h-3 bg-[#c4c6cd] mx-0.5"></span>
          <span>Sync: {telemetry?.lastSyncAt || '10:42 AM'}</span>
        </div>

        {/* Command Center Button */}
        <button
          onClick={() => onNavigate(user ? 'command-dashboard' : 'command-login')}
          className={`px-3.5 py-1.5 border rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
            isCommandView
              ? 'bg-[#0b1f33] text-white border-[#0b1f33] shadow-xs'
              : 'bg-white text-[#1b1c1d] border-[#c4c6cd] hover:bg-slate-50'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-[#0051d5]" />
          <span>Command Center</span>
          {user && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5"></span>
          )}
        </button>

        {/* Report Emergency Button */}
        <button
          onClick={() => onNavigate('citizen-report')}
          className="px-3.5 py-1.5 bg-[#0051d5] text-white rounded hover:bg-[#0041ab] transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs shadow-blue-500/20 active:scale-98"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Report Emergency</span>
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-1 border-l border-[#c4c6cd]/40 pl-2 h-7">
          <button
            onClick={() => onNavigate('command-incidents')}
            title="Active Alerts"
            className="p-1.5 text-[#44474c] hover:text-[#00050e] hover:bg-[#e4e2e4] rounded transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 border border-white"></span>
          </button>
          <button
            onClick={() => onNavigate('command-status')}
            title="System Settings"
            className="p-1.5 text-[#44474c] hover:text-[#00050e] hover:bg-[#e4e2e4] rounded transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
