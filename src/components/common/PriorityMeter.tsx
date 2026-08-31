import React from 'react';
import { IncidentPriorityScore } from '@/src/types/incident';

interface PriorityMeterProps {
  priority: IncidentPriorityScore;
}

export const PriorityMeter: React.FC<PriorityMeterProps> = ({ priority }) => {
  const isCritical = priority.overall >= 80;
  const isHigh = priority.overall >= 65;

  let barColor = 'bg-[#059669]';
  let textColor = 'text-[#059669]';
  if (isCritical) {
    barColor = 'bg-[#ba1a1a]';
    textColor = 'text-[#ba1a1a]';
  } else if (isHigh) {
    barColor = 'bg-[#d97706]';
    textColor = 'text-[#d97706]';
  }

  return (
    <div className="border border-slate-200 rounded p-3 bg-white flex flex-col gap-3 shadow-xs">
      <div className="flex justify-between items-end">
        <span className={`text-[32px] font-bold leading-none ${textColor} font-heading`}>
          {priority.overall}
          <span className="text-[14px] text-slate-500 font-medium font-sans">/100</span>
        </span>
        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {priority.tier}
        </span>
      </div>

      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${priority.overall}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2">
        <div className="flex justify-between items-center text-slate-600">
          <span>Life Threat Risk</span>
          <span className="font-semibold text-slate-900 font-mono-data">{priority.lifeThreatRisk}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Infrastructure</span>
          <span className="font-semibold text-slate-900 font-mono-data">{priority.infrastructureRisk}</span>
        </div>
      </div>
    </div>
  );
};
