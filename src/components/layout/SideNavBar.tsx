import React from 'react';
import {
  Shield,
  BrainCircuit,
  Truck,
  Activity,
  Map as MapIcon,
  FileText,
  Radio,
  HelpCircle,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useAuth } from '@/src/context/AuthContext';

interface SideNavBarProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({ currentRoute, onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'command-dashboard' as RoutePath,
      label: 'Command Center',
      icon: Shield,
    },
    {
      id: 'command-incidents' as RoutePath,
      label: 'Intelligence & Incidents',
      icon: BrainCircuit,
    },
    {
      id: 'command-map' as RoutePath,
      label: 'Operational Map',
      icon: MapIcon,
    },
    {
      id: 'command-resources' as RoutePath,
      label: 'Resource Manager',
      icon: Truck,
    },
    {
      id: 'command-reports' as RoutePath,
      label: 'Citizen Triage Reports',
      icon: FileText,
    },
    {
      id: 'command-status' as RoutePath,
      label: 'Analytics & Telemetry',
      icon: Activity,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-40 p-4 pt-20 bg-[#fbf9fb] border-r border-[#c4c6cd]/60 select-none">
      {/* Sidebar Header */}
      <div className="mb-6 px-2 flex items-center gap-3">
        <div className="w-9 h-9 bg-[#0b1f33] rounded flex items-center justify-center text-white shadow-xs">
          <Shield className="w-5 h-5 fill-current text-blue-400" />
        </div>
        <div>
          <h2 className="font-heading text-sm font-bold text-[#00050e] leading-tight">
            CrisisLink
          </h2>
          <p className="text-[10px] font-bold text-[#74777d] uppercase tracking-wider">
            Operational Hub
          </p>
        </div>
      </div>

      {/* Operator Badge */}
      {user && (
        <div className="mb-4 p-2.5 bg-white border border-[#c4c6cd]/70 rounded text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <UserCheck className="w-3.5 h-3.5 text-[#0051d5] shrink-0" />
            <div className="truncate">
              <span className="font-bold text-slate-800 block truncate">{user.name}</span>
              <span className="text-[10px] text-slate-500 font-mono-data">
                {user.badgeNumber} • {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log out"
            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation list */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-[#316bf3] text-white shadow-xs'
                  : 'text-[#44474c] hover:bg-[#e4e2e4]/70 hover:text-[#00050e]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#74777d]'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer support & status */}
      <div className="mt-auto flex flex-col gap-1 border-t border-[#c4c6cd]/40 pt-4">
        <button
          onClick={() => onNavigate('citizen-status')}
          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#44474c] hover:bg-[#e4e2e4] rounded transition-colors text-left"
        >
          <Radio className="w-4 h-4 text-[#74777d]" />
          <span>Network Status</span>
        </button>
        <button
          onClick={() => onNavigate('citizen-landing')}
          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#44474c] hover:bg-[#e4e2e4] rounded transition-colors text-left"
        >
          <HelpCircle className="w-4 h-4 text-[#74777d]" />
          <span>Public Portal Home</span>
        </button>
      </div>
    </aside>
  );
};
