import React from 'react';

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="animate-pulse rounded border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-slate-200 rounded"></div>
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
      </div>
      <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-3 w-full bg-slate-100 rounded"></div>
        ))}
      </div>
    </div>
  );
};
