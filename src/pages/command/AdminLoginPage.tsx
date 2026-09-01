import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useAuth } from '@/src/context/AuthContext';

interface AdminLoginPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { loginWithCredentials, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = authLoading || localLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLocalLoading(true);

    try {
      await loginWithCredentials(email, password);
      onNavigate('command-dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 space-y-6">
      {/* Header Badge */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#0B1F33] text-white rounded-lg flex items-center justify-center mx-auto shadow-sm border border-[#0B1F33]/40">
          <Shield className="w-6 h-6 fill-current text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-[#101828] font-heading tracking-tight">
          CrisisLink Command Center
        </h1>
        <p className="text-xs text-[#52606D]">
          Restricted access for Municipal Police, SDRF, and Emergency CAD Dispatchers
        </p>
      </div>

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
            Secure Authentication
          </span>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded font-mono-data focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* Password Field with Show/Hide */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-700">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Authenticate Operator</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
