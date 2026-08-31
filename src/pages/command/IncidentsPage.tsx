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
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { StatusBadge } from '@/src/components/common/StatusBadge';
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
  const { incidents, updateIncidentStatus, stats } = useEmergencyData();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
    <div className="space-y-6 pb-12 p-4 lg:p-6 bg-[#fbf9fb] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c4c6cd]/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0051d5]"></span>
            <span className="text-xs font-bold font-mono-data text-[#0051d5] uppercase tracking-wider">
              CAD Incident Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#00050e] font-heading">
            Incident Management & Triage Ledger
          </h1>
          <p className="text-xs text-[#74777d] mt-0.5">
            Active crisis queue, severity scoring, and first responder allocation matrix.
          </p>
        </div>

        <button
          onClick={() => onNavigate('citizen-report')}
          className="px-4 py-2 bg-[#0051d5] hover:bg-[#0041ab] text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Incident Manually
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-[#c4c6cd]/60 rounded-lg shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident code, keyword, sector, or street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded bg-white font-mono-data text-slate-700"
          >
            <option value="ALL">Severity: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="ACTIVE">Active</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded bg-white font-mono-data text-slate-700"
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAGED">Triaged</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="ON_SCENE">On Scene</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incident Table */}
      <div className="bg-white border border-[#c4c6cd]/60 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fbf9fb] border-b border-[#c4c6cd]/60 text-[#74777d] uppercase font-mono-data text-[10px]">
              <tr>
                <th className="py-3 px-4">Code / Incident</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location / Sector</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Units Assigned</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c6cd]/30">
              {filteredIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data font-bold text-slate-900">{inc.code}</span>
                      <span className="font-medium text-slate-800">{inc.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono-data block mt-0.5">
                      {formatRelativeTime(inc.reportedAt)}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono-data text-[11px] text-slate-600">
                    {inc.category}
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-slate-800 block truncate max-w-[160px]">
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
                    <span className="font-mono-data font-bold text-slate-900">
                      {inc.priority.overall}/100
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={inc.status}
                      onChange={(e) =>
                        updateIncidentStatus(inc.id, e.target.value as IncidentStatus)
                      }
                      className="px-2 py-1 text-[11px] border border-slate-200 rounded font-mono-data bg-white text-slate-700"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="TRIAGED">TRIAGED</option>
                      <option value="DISPATCHED">DISPATCHED</option>
                      <option value="ON_SCENE">ON_SCENE</option>
                      <option value="CONTAINED">CONTAINED</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 font-mono-data text-[11px]">
                    {inc.assignedResourceIds.length > 0 ? (
                      <span className="text-emerald-700 font-semibold">
                        {inc.assignedResourceIds.length} Dispatched
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
                      className="px-2.5 py-1 text-xs font-semibold text-[#0051d5] hover:text-[#0041ab] hover:bg-blue-50 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
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
