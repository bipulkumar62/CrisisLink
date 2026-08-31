import React, { useState } from 'react';
import {
  Shield,
  Radio,
  Lock,
  ArrowRight,
  UserCheck,
  CheckCircle,
  KeyRound,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useAuth } from '@/src/context/AuthContext';
import { UserRole } from '@/src/types/auth';

interface AdminLoginPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { loginDemo, loginWithCredentials, isLoading, user } = useAuth();
  const [badgeNumber, setBadgeNumber] = useState('IC-4091');
  const [password, setPassword] = useState('••••••••••••');

  const handleDemoRole = async (role: UserRole) => {
    await loginDemo(role);
    onNavigate('command-dashboard');
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithCredentials(badgeNumber, password);
    onNavigate('command-dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#0b1f33] text-white rounded-lg flex items-center justify-center mx-auto shadow-md">
          <Shield className="w-6 h-6 fill-current text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">
          Protected Command Center
        </h1>
        <p className="text-xs text-slate-500">
          First Responder & CAD Operator Access Portal
        </p>
      </div>

      {/* Quick Demo Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Quick Operator Profiles (Demo)
          </span>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-mono-data px-1.5 py-0.5 rounded font-bold">
            Simulated
          </span>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleDemoRole('INCIDENT_COMMANDER')}
            disabled={isLoading}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                IC
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                  Cmdr. Sarah Vance
                </span>
                <span className="text-[10px] text-slate-500 font-mono-data">
                  IC-4091 • Incident Commander
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoRole('DISPATCHER')}
            disabled={isLoading}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                DSP
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                  Officer David Kim
                </span>
                <span className="text-[10px] text-slate-500 font-mono-data">
                  DSP-8201 • Dispatcher
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoRole('RESOURCE_COORDINATOR')}
            disabled={isLoading}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                RC
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                  Rachel Sterling
                </span>
                <span className="text-[10px] text-slate-500 font-mono-data">
                  RC-1104 • Fleet Coordinator
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleCustomLogin} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Agency Credential Sign-In
        </h3>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Badge / Operator ID</label>
          <input
            type="text"
            required
            value={badgeNumber}
            onChange={(e) => setBadgeNumber(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-mono-data focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Security PIN / Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-[#0051d5] hover:bg-[#0041ab] text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Lock className="w-3.5 h-3.5" />
          Authenticate Operator Session
        </button>
      </form>
    </div>
  );
};
