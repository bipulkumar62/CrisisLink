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
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full z-40 p-4 bg-slate-50 border-r border-slate-200 select-none">
      {/* Sidebar Header */}
      <div className="mb-6 px-2 flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-900 rounded-md flex items-center justify-center text-white shadow-sm">
          <Shield className="w-5 h-5 fill-current text-blue-500" />
        </div>
        <div>
          <h2 className="font-heading text-sm font-bold text-slate-900 leading-tight">
            CrisisLink
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Operational Hub
          </p>
        </div>
      </div>

      {/* Operator Badge */}
      {user && (
        <div className="mb-4 p-2.5 bg-white border border-slate-200 rounded-md text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
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
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer support & status */}
      <div className="mt-auto flex flex-col gap-1 border-t border-slate-200 pt-4">
        <button
          onClick={() => onNavigate('citizen-status')}
          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 rounded-md transition-colors text-left"
        >
          <Radio className="w-4 h-4 text-slate-400" />
          <span>Network Status</span>
        </button>
        <button
          onClick={() => onNavigate('citizen-landing')}
          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 rounded-md transition-colors text-left"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Public Portal Home</span>
        </button>
      </div>
    </aside>
  );
};
