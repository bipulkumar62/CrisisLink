import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { IncidentSeverity, IncidentStatus } from '@/src/types/incident';

interface StatusBadgeProps {
  severity?: IncidentSeverity | string;
  status?: IncidentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ severity, status, size = 'sm' }) => {
  if (severity) {
    const isCritical = severity === 'CRITICAL';
    const isHigh = severity === 'HIGH';
    const isActive = severity === 'ACTIVE' || severity === 'MEDIUM';

    let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let icon = <CheckCircle className="w-3 h-3" />;

    if (isCritical) {
      bg = 'bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/30';
      icon = <AlertCircle className="w-3 h-3 fill-current" />;
    } else if (isHigh) {
      bg = 'bg-[#f59e0b]/10 text-[#d97706] border-[#f59e0b]/30';
      icon = <AlertTriangle className="w-3 h-3 fill-current" />;
    } else if (isActive) {
      bg = 'bg-[#0051d5]/10 text-[#0051d5] border-[#0051d5]/30';
      icon = <Info className="w-3 h-3 fill-current" />;
    }

    const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold tracking-wider uppercase border rounded font-mono-data ${bg} ${padding}`}
      >
        {icon}
        {severity}
      </span>
    );
  }

  if (status) {
    const isResolved = status === 'RESOLVED';
    const isDispatched = status === 'DISPATCHED' || status === 'ON_SCENE';
    const isTriaged = status === 'TRIAGED';

    let bg = 'bg-slate-100 text-slate-700 border-slate-200';
    if (isResolved) bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (isDispatched) bg = 'bg-blue-50 text-blue-700 border-blue-200';
    else if (isTriaged) bg = 'bg-purple-50 text-purple-700 border-purple-200';

    return (
      <span
        className={`inline-flex items-center font-medium tracking-wide uppercase border rounded font-mono-data px-1.5 py-0.5 text-[10px] ${bg}`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  }

  return null;
};
