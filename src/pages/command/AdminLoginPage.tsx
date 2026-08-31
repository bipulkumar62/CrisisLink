import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  ServerCrash,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useAuth } from '@/src/context/AuthContext';
import { UserRole } from '@/src/types/auth';

interface AdminLoginPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { loginDemo, loginWithCredentials, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('commander@crisislink.jaipur.gov.in');
  const [password, setPassword] = useState('CAD-AlphaSecure-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState<boolean>(false);
  const [simulateInvalidCredentials, setSimulateInvalidCredentials] = useState<boolean>(false);

  const isLoading = authLoading || localLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (serviceUnavailable) {
      setErrorMessage('Service Unavailable (HTTP 503): CAD Auth Gateway node is currently unreachable. Try reconnecting to Jaipur DC-1.');
      return;
    }

    if (simulateInvalidCredentials || password !== 'CAD-AlphaSecure-2026') {
      setLocalLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLocalLoading(false);
      setErrorMessage('Invalid credentials. Badge ID / Email or security token mismatch for Jaipur District command.');
      return;
    }

    setLocalLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    await loginWithCredentials(email, password);
    setLocalLoading(false);
    onNavigate('command-dashboard');
  };

  const handleDemoOperator = async (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('CAD-AlphaSecure-2026');
    setErrorMessage(null);
    await loginDemo(role);
    onNavigate('command-dashboard');
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 space-y-6">
      {/* Header Badge */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#0B1F33] text-white rounded-lg flex items-center justify-center mx-auto shadow-sm border border-[#0B1F33]/40">
          <Shield className="w-6 h-6 fill-current text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-[#101828] font-heading tracking-tight">
          CAD Command Center Authentication
        </h1>
        <p className="text-xs text-[#52606D]">
          Restricted access for Jaipur Municipal Police, SDRF, and Emergency CAD Dispatchers
        </p>
      </div>

      {/* State Simulation Controls for Reviewers / Testers */}
      <div className="bg-slate-50 border border-[#D9E0E7] rounded-lg p-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono-data font-bold text-slate-700 uppercase text-[10px]">
            Test State Simulators:
          </span>
          <span className="text-[10px] text-slate-500 font-mono-data">Click to test error states</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSimulateInvalidCredentials(!simulateInvalidCredentials);
              setErrorMessage(null);
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-mono-data font-semibold border transition-colors ${
              simulateInvalidCredentials
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {simulateInvalidCredentials ? '✓ Simulating: Invalid Credentials' : 'Simulate: Invalid Credentials'}
          </button>
          <button
            type="button"
            onClick={() => {
              setServiceUnavailable(!serviceUnavailable);
              setErrorMessage(null);
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-mono-data font-semibold border transition-colors ${
              serviceUnavailable
                ? 'bg-red-100 text-red-900 border-red-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {serviceUnavailable ? '✓ Simulating: Service Unavailable (503)' : 'Simulate: Service Unavailable (503)'}
          </button>
        </div>
      </div>

      {/* Service Unavailable Banner */}
      {serviceUnavailable && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-900">
          <ServerCrash className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Service Unavailable State Active</span>
            <p className="text-red-800 text-[11px]">
              CAD Authentication Gateway is simulating an offline / maintenance state. Authentication requests will reject with HTTP 503.
            </p>
          </div>
        </div>
      )}

      {/* Invalid Credentials Error Banner */}
      {errorMessage && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-950 animate-shake">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Authentication Failed</span>
            <p className="text-amber-900 text-[11px]">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Secure Login Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#D9E0E7] rounded-xl p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-data">
            Official CAD Agency Sign-In
          </span>
          <span className="text-[10px] font-mono-data text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-bold">
            <Lock className="w-3 h-3" />
            256-Bit Encrypted
          </span>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Official Agency Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. commander@crisislink.jaipur.gov.in"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded font-mono-data focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* Password Field with Show/Hide */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-700">
              Security Token / Password
            </label>
            <span className="text-[10px] text-slate-400 font-mono-data">Min 12 chars</span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure password"
              className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded font-mono-data focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden disabled:bg-slate-100"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 focus:outline-hidden"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Button with Loading */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-[#0B1F33] hover:bg-[#1A365D] text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying Operator Clearance...</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Authenticate Operator Session</span>
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono-data">
          <span>Server: JAIPUR-CAD-GATEWAY-01</span>
          <span>Policy: ISO/IEC 27001</span>
        </div>
      </form>

      {/* Quick Demo Operator Switcher */}
      <div className="bg-white border border-[#D9E0E7] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-data">
            Quick 1-Click Operator Clearance (Demo)
          </span>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-mono-data px-2 py-0.5 rounded font-bold">
            Auto-Fill & Access
          </span>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleDemoOperator('INCIDENT_COMMANDER', 'commander.rathore@crisislink.jaipur.gov.in')}
            disabled={isLoading}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs font-mono-data">
                IC
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                  Cmdr. Rajesh Rathore
                </span>
                <span className="text-[10px] text-slate-500 font-mono-data">
                  JC-COMMAND-01 • Incident Commander (Full Municipal Authority)
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoOperator('DISPATCHER', 'dispatcher.mathur@crisislink.jaipur.gov.in')}
            disabled={isLoading}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs font-mono-data">
                DSP
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                  Officer Priya Mathur
                </span>
                <span className="text-[10px] text-slate-500 font-mono-data">
                  JC-DISPATCH-14 • Dispatch Operator (Sector 1-3 & 7)
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoOperator('RESOURCE_COORDINATOR', 'fleet.meena@crisislink.jaipur.gov.in')}
            disabled={isLoading}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs font-mono-data">
                RC
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                  Karan Meena
                </span>
                <span className="text-[10px] text-slate-500 font-mono-data">
                  JC-FLEET-08 • Resource & Shelter Coordinator
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
