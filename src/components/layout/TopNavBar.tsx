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
    <header className="fixed top-0 left-0 w-full z-50 flex flex-col bg-white border-b border-[#D9E0E7]">
      {/* Topmost Prototype & Regional Simulation Alert Bar */}
      <div className="bg-[#0B1F33] text-[#F7F8FA] px-3 sm:px-6 py-1 text-[11px] flex items-center justify-between font-mono-data border-b border-[#0B1F33]/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16803A] animate-pulse shrink-0"></span>
          <span className="font-semibold text-white tracking-wide">
            {APP_CONFIG.REGION_LABEL}
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">
            Jaipur CAD Operations Mesh Online
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-300 hidden md:inline">
            Direct Helpline: <span className="text-white font-bold">{APP_CONFIG.HOTLINE_EMERGENCY}</span> (National Emergency)
          </span>
          <span className="text-xs px-1.5 py-0.2 bg-[#2563EB] text-white rounded font-bold uppercase tracking-wider">
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
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded bg-[#0B1F33] flex items-center justify-center text-white shadow-xs group-hover:bg-[#2563EB] transition-colors">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-[#101828] leading-none block">
                CrisisLink
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#52606D] block">
                Jaipur Municipal Grid
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 pl-3 border-l border-[#D9E0E7] h-7">
            <button
              onClick={() => handleNav('citizen-landing')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                currentRoute === 'citizen-landing'
                  ? 'text-[#2563EB] bg-blue-50 font-bold'
                  : 'text-[#52606D] hover:text-[#101828] hover:bg-[#F7F8FA]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleNav('citizen-live')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                currentRoute === 'citizen-live'
                  ? 'text-[#2563EB] bg-blue-50 font-bold'
                  : 'text-[#52606D] hover:text-[#101828] hover:bg-[#F7F8FA]'
              }`}
            >
              <span>Live Incidents</span>
              {criticalCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#D92D20] text-white text-[10px] rounded-full font-mono-data font-bold">
                  {criticalCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNav('citizen-status')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                currentRoute === 'citizen-status'
                  ? 'text-[#2563EB] bg-blue-50 font-bold'
                  : 'text-[#52606D] hover:text-[#101828] hover:bg-[#F7F8FA]'
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
            className={`px-3 py-1.5 border rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isCommandView
                ? 'bg-[#0B1F33] text-white border-[#0B1F33]'
                : 'bg-white text-[#101828] border-[#D9E0E7] hover:bg-[#F7F8FA]'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="hidden sm:inline">Command Center</span>
            <span className="sm:hidden">CAD</span>
            {user && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#16803A]"></span>
            )}
          </button>

          {/* Report Emergency Primary Action Button */}
          <button
            onClick={() => handleNav('citizen-report')}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-blue-500/20 active:scale-98"
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
