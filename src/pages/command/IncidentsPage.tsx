import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowRight,
  Eye,
  MapPin,
  Clock,
  Shield,
  Layers,
  AlertTriangle,
  Truck,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
import { IncidentsTableSkeleton } from '@/src/components/common/SkeletonLoaders';
import { formatRelativeTime } from '@/src/utils/formatters';
import { IncidentStatus, IncidentSeverity } from '@/src/types/incident';

interface IncidentsPageProps {
  onNavigate: (route: RoutePath) => void;
  onSelectIncidentDetail: (code: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  onNavigate,
  onSelectIncidentDetail,
}) => {
  const { incidents, updateIncidentStatus, stats, isLoading } = useEmergencyData();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (isLoading) {
    return <IncidentsTableSkeleton />;
  }

  const filteredIncidents = incidents.filter((inc) => {
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.code.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.location.address.toLowerCase().includes(q) ||
        inc.location.sector.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 p-4 lg:p-6 bg-[#F7F8FA] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E0E7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
            <span className="text-xs font-bold font-mono-data text-[#2563EB] uppercase tracking-wider">
              CAD Incident Intelligence Matrix
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#101828] font-heading tracking-tight">
            Incident Management & Triage Ledger
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Active crisis queue, severity scoring, and first responder allocation matrix across Jaipur municipal sectors.
          </p>
        </div>

        <button
          onClick={() => onNavigate('citizen-report')}
          className="px-4 py-2 bg-[#0B1F33] hover:bg-slate-900 text-white rounded text-xs font-bold font-mono-data flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Manual Ingestion</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 border border-[#D9E0E7] rounded-xl shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident code (CR-JP-102), keyword, sector, or street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded font-mono-data focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded bg-white font-mono-data font-bold text-slate-800"
          >
            <option value="ALL">Severity: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="ACTIVE">Medium / Active</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded bg-white font-mono-data font-bold text-slate-800"
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="TRIAGED">TRIAGED</option>
            <option value="DISPATCHED">DISPATCHED</option>
            <option value="ON_SCENE">ON SCENE</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Incident Table */}
      <div className="bg-white border border-[#D9E0E7] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#D9E0E7] text-[#52606D] uppercase font-mono-data text-[10px]">
              <tr>
                <th className="py-3 px-4">Code / Incident</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location / Sector</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4">Status Workflow</th>
                <th className="py-3 px-4">Units Dispatched</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E0E7]">
              {filteredIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {inc.code}
                      </span>
                      <span className="font-bold text-[#101828]">{inc.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono-data block mt-1">
                      Reported {formatRelativeTime(inc.reportedAt)}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono-data text-[11px] text-slate-700">
                    {inc.category}
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[#101828] font-medium block truncate max-w-[160px]">
                      {inc.location.address}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-data">
                      {inc.location.sector}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge severity={inc.severity} />
                  </td>

                  <td className="py-3 px-4">
                    <span className={`font-mono-data font-bold ${
                      inc.priority.overall >= 80 ? 'text-[#D92D20]' : inc.priority.overall >= 60 ? 'text-[#D97706]' : 'text-slate-800'
                    }`}>
                      {inc.priority.overall}/100
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={inc.status}
                      onChange={(e) =>
                        updateIncidentStatus(inc.id, e.target.value as IncidentStatus)
                      }
                      className="px-2 py-1 text-[11px] border border-slate-300 rounded font-mono-data font-bold bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="TRIAGED">TRIAGED</option>
                      <option value="DISPATCHED">DISPATCHED</option>
                      <option value="ON_SCENE">ON SCENE</option>
                      <option value="CONTAINED">CONTAINED</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 font-mono-data text-[11px]">
                    {inc.assignedResourceIds.length > 0 ? (
                      <span className="text-[#16803A] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {inc.assignedResourceIds.length} Assigned
                      </span>
                    ) : (
                      <span className="text-slate-400">0 Units</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectIncidentDetail(inc.code);
                        onNavigate('command-incident-detail');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-[#2563EB] hover:text-blue-800 hover:bg-blue-50 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Dossier</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
