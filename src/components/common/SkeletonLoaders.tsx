import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F8FA] animate-pulse">
      {/* Top Metrics Row Skeleton */}
      <div className="flex items-center gap-6 px-4 lg:px-6 py-3 bg-[#F7F8FA] border-b border-[#D9E0E7] shrink-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2 pr-6 border-r border-[#D9E0E7]">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <div className="space-y-1">
              <div className="w-12 h-2.5 bg-slate-200 rounded"></div>
              <div className="w-8 h-5 bg-slate-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* 3-Column Layout Skeleton */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left column */}
        <div className="w-full lg:w-80 shrink-0 bg-white border-r border-[#D9E0E7] p-3 space-y-3">
          <div className="w-32 h-4 bg-slate-200 rounded mb-2"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 border border-slate-100 rounded-lg space-y-2 bg-slate-50">
              <div className="flex justify-between">
                <div className="w-16 h-3 bg-slate-200 rounded"></div>
                <div className="w-12 h-3 bg-slate-200 rounded"></div>
              </div>
              <div className="w-3/4 h-4 bg-slate-300 rounded"></div>
              <div className="w-20 h-2.5 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Center map */}
        <div className="flex-1 bg-slate-200 flex items-center justify-center">
          <div className="text-slate-400 text-xs font-mono-data">Loading Tactical Geospatial Mesh...</div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-96 shrink-0 bg-white border-l border-[#D9E0E7] p-4 space-y-4">
          <div className="space-y-2">
            <div className="w-20 h-3 bg-slate-200 rounded"></div>
            <div className="w-48 h-5 bg-slate-300 rounded"></div>
            <div className="w-36 h-3 bg-slate-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-14 bg-slate-100 rounded"></div>
            <div className="h-14 bg-slate-100 rounded"></div>
          </div>
          <div className="h-24 bg-slate-100 rounded"></div>
          <div className="h-28 bg-slate-100 rounded"></div>
          <div className="h-10 bg-slate-300 rounded mt-auto"></div>
        </div>
      </div>
    </div>
  );
};

export const IncidentsTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-4 lg:p-6 bg-[#F7F8FA] min-h-full animate-pulse">
      <div className="flex justify-between border-b border-[#D9E0E7] pb-4">
        <div className="space-y-2">
          <div className="w-32 h-3 bg-slate-200 rounded"></div>
          <div className="w-64 h-6 bg-slate-300 rounded"></div>
        </div>
        <div className="w-36 h-9 bg-slate-300 rounded"></div>
      </div>

      <div className="h-12 bg-white border border-[#D9E0E7] rounded-xl"></div>

      <div className="bg-white border border-[#D9E0E7] rounded-xl overflow-hidden shadow-xs">
        <div className="h-10 bg-slate-50 border-b border-[#D9E0E7]"></div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
              <div className="w-1/6 h-4 bg-slate-100 rounded"></div>
              <div className="w-1/6 h-4 bg-slate-100 rounded"></div>
              <div className="w-16 h-4 bg-slate-200 rounded"></div>
              <div className="w-20 h-6 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const IncidentDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-4 lg:p-6 bg-[#F7F8FA] min-h-full animate-pulse">
      <div className="w-28 h-4 bg-slate-200 rounded"></div>
      <div className="bg-white border border-[#D9E0E7] rounded-xl p-6 space-y-4">
        <div className="flex justify-between">
          <div className="w-32 h-6 bg-slate-300 rounded"></div>
          <div className="w-28 h-6 bg-slate-200 rounded"></div>
        </div>
        <div className="w-2/3 h-8 bg-slate-300 rounded"></div>
        <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-32 bg-white border border-[#D9E0E7] rounded-xl p-5"></div>
          <div className="h-44 bg-white border border-[#D9E0E7] rounded-xl p-5"></div>
          <div className="h-48 bg-white border border-[#D9E0E7] rounded-xl p-5"></div>
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-white border border-[#D9E0E7] rounded-xl p-5"></div>
          <div className="h-48 bg-white border border-[#D9E0E7] rounded-xl p-5"></div>
        </div>
      </div>
    </div>
  );
};

export const ResourceGridSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-4 lg:p-6 bg-[#F7F8FA] min-h-full animate-pulse">
      <div className="flex justify-between border-b border-[#D9E0E7] pb-4">
        <div className="space-y-2">
          <div className="w-32 h-3 bg-slate-200 rounded"></div>
          <div className="w-56 h-6 bg-slate-300 rounded"></div>
        </div>
        <div className="w-40 h-10 bg-slate-200 rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-[#D9E0E7] rounded-xl p-5 space-y-4">
            <div className="flex justify-between">
              <div className="w-24 h-5 bg-slate-300 rounded"></div>
              <div className="w-16 h-4 bg-slate-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-100 rounded"></div>
              <div className="w-3/4 h-3 bg-slate-100 rounded"></div>
              <div className="w-1/2 h-3 bg-slate-100 rounded"></div>
            </div>
            <div className="w-full h-8 bg-slate-200 rounded pt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReportsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-4 lg:p-6 bg-[#F7F8FA] min-h-full animate-pulse">
      <div className="flex justify-between border-b border-[#D9E0E7] pb-4">
        <div className="space-y-2">
          <div className="w-36 h-3 bg-slate-200 rounded"></div>
          <div className="w-64 h-6 bg-slate-300 rounded"></div>
        </div>
        <div className="w-32 h-8 bg-slate-200 rounded"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#D9E0E7] rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <div className="w-24 h-4 bg-slate-300 rounded"></div>
                <div className="w-16 h-3 bg-slate-200 rounded"></div>
              </div>
              <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
              <div className="w-full h-8 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
        <div className="h-96 bg-white border border-[#D9E0E7] rounded-xl p-5"></div>
      </div>
    </div>
  );
};

export const SystemStatusSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-4 lg:p-6 bg-[#F7F8FA] min-h-full animate-pulse">
      <div className="flex justify-between border-b border-[#D9E0E7] pb-4">
        <div className="space-y-2">
          <div className="w-32 h-3 bg-slate-200 rounded"></div>
          <div className="w-60 h-6 bg-slate-300 rounded"></div>
        </div>
        <div className="w-28 h-8 bg-slate-200 rounded"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white border border-[#D9E0E7] rounded-xl p-4"></div>
        ))}
      </div>
      <div className="h-64 bg-white border border-[#D9E0E7] rounded-xl p-6"></div>
    </div>
  );
};

export const MapSkeleton: React.FC = () => {
  return (
    <div className="w-full h-[600px] bg-slate-200 rounded-xl flex items-center justify-center animate-pulse border border-[#D9E0E7]">
      <div className="text-slate-400 text-xs font-mono-data">Loading Tactical Geospatial Mesh...</div>
    </div>
  );
};
