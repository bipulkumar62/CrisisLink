import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-slate-300 rounded-lg">
      <div className="p-3 bg-slate-100 rounded-full text-slate-500 mb-3">
        {icon || <ShieldCheck className="w-8 h-8 text-emerald-600" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0051d5] rounded hover:bg-[#0041ab] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
