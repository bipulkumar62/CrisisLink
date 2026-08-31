import React, { useState } from 'react';
import { Shield, Bell, Settings, AlertTriangle, Radio, Menu, X, MapPin } from 'lucide-react';
import { RoutePath, APP_CONFIG } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { useAuth } from '@/src/context/AuthContext';

interface TopNavBarProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ currentRoute, onNavigate }) => {
  const { telemetry, incidents } = useEmergencyData();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isCommandView = currentRoute.startsWith('command-');
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;

  const handleNav = (route: RoutePath) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex flex-col bg-white border-b border-slate-200">
      {/* Topmost Prototype & Regional Simulation Alert Bar */}
      <div className="bg-slate-900 text-slate-100 px-3 sm:px-6 py-1.5 text-[11px] flex items-center justify-between font-mono-data border-b border-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-semibold text-white tracking-wide">
            {APP_CONFIG.REGION_LABEL}
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">
            Jaipur CAD Operations Mesh Online
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden md:inline">
            Direct Helpline: <span className="text-white font-bold">{APP_CONFIG.HOTLINE_EMERGENCY}</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-600 text-white rounded font-bold uppercase tracking-wider">
            Live Feed
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 h-14 bg-white">
        {/* Brand & Desktop Links */}
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            onClick={() => handleNav('citizen-landing')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <Shield className="w-4 h-4 fill-current text-blue-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight text-slate-900 leading-none block">
                CrisisLink
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mt-0.5">
                Jaipur Municipal Grid
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 ml-2 border-l border-slate-200 h-8">
            <button
              onClick={() => handleNav('citizen-landing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentRoute === 'citizen-landing'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleNav('citizen-live')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                currentRoute === 'citizen-live'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Live Incidents</span>
              {criticalCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded-full font-mono-data font-bold leading-none">
                  {criticalCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNav('citizen-status')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentRoute === 'citizen-status'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              System Telemetry
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Command Center Access */}
          <button
            onClick={() => handleNav(user ? 'command-dashboard' : 'command-login')}
            className={`px-3 py-1.5 border rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isCommandView
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isCommandView ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">Command Center</span>
            <span className="sm:hidden">CAD</span>
            {user && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button>

          {/* Report Emergency Primary Action Button */}
          <button
            onClick={() => handleNav('citizen-report')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Report Emergency</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#52606D] hover:text-[#101828] hover:bg-[#F7F8FA] rounded"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#D9E0E7] px-4 py-3 space-y-2 shadow-md">
          <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#52606D] font-bold">
            Navigation Menu
          </div>
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleNav('citizen-landing')}
              className={`w-full text-left px-3 py-2 rounded text-xs font-semibold ${
                currentRoute === 'citizen-landing' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#101828]'
              }`}
            >
              Overview & Portal
            </button>
            <button
              onClick={() => handleNav('citizen-live')}
              className={`w-full text-left px-3 py-2 rounded text-xs font-semibold flex items-center justify-between ${
                currentRoute === 'citizen-live' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#101828]'
              }`}
            >
              <span>Live Emergency Map</span>
              <span className="px-1.5 py-0.5 bg-[#D92D20] text-white text-[10px] rounded font-mono-data font-bold">
                {incidents.length} Active
              </span>
            </button>
            <button
              onClick={() => handleNav('citizen-status')}
              className={`w-full text-left px-3 py-2 rounded text-xs font-semibold ${
                currentRoute === 'citizen-status' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#101828]'
              }`}
            >
              Jaipur Grid Status & Telemetry
            </button>
            <button
              onClick={() => handleNav(user ? 'command-dashboard' : 'command-login')}
              className={`w-full text-left px-3 py-2 rounded text-xs font-semibold flex items-center gap-2 ${
                isCommandView ? 'bg-[#0B1F33] text-white' : 'text-[#101828]'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Operator CAD Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
