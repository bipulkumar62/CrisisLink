import React, { useState } from 'react';
import {
  Truck,
  Shield,
  HeartPulse,
  Flame,
  Search,
  CheckCircle,
  Radio,
  MapPin,
  Clock,
  BatteryCharging,
  Layers,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { UnitStatus, UnitType, ResourceUnit } from '@/src/types/resource';

interface ResourcesPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onNavigate }) => {
  const { resources, updateResourceStatus } = useEmergencyData();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<UnitType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'ALL'>('ALL');

  const filteredResources = resources.filter((res) => {
    if (typeFilter !== 'ALL' && res.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && res.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.callsign.toLowerCase().includes(q) ||
        res.station.toLowerCase().includes(q) ||
        res.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadgeColor = (status: UnitStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'EN_ROUTE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ON_SCENE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'RETURNING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MAINTENANCE':
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 p-4 lg:p-6 bg-[#fbf9fb] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c4c6cd]/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold font-mono-data text-emerald-700 uppercase tracking-wider">
              Fleet & First Responder Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#00050e] font-heading">
            Resource Allocation & Fleet Manager
          </h1>
          <p className="text-xs text-[#74777d] mt-0.5">
            Monitor real-time unit status, GPS coordinates, crew capacity, and operational readiness.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-data bg-white p-2.5 border border-[#c4c6cd]/60 rounded shadow-2xs">
          <div>
            <span className="text-slate-400 block">Available Units:</span>
            <span className="font-bold text-emerald-600">
              {resources.filter((r) => r.status === 'AVAILABLE').length} / {resources.length}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block">Deployed:</span>
            <span className="font-bold text-blue-600">
              {resources.filter((r) => r.status !== 'AVAILABLE' && r.status !== 'MAINTENANCE').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 border border-[#c4c6cd]/60 rounded-lg shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search callsign (R02, A01), station, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as UnitType | 'ALL')}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded bg-white font-mono-data text-slate-700"
          >
            <option value="ALL">All Types</option>
            <option value="RESCUE_TEAM">Rescue Team</option>
            <option value="AMBULANCE">Ambulance</option>
            <option value="FIRE_ENGINE">Fire Engine</option>
            <option value="POLICE_PATROL">Police Patrol</option>
            <option value="DRONE_RECON">Drone Recon</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UnitStatus | 'ALL')}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded bg-white font-mono-data text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="ON_SCENE">On Scene</option>
            <option value="RETURNING">Returning</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white border border-[#c4c6cd]/60 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-blue-400 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-blue-50 text-[#0051d5] flex items-center justify-center font-bold text-xs">
                    {res.callsign.substring(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900 leading-tight">
                      {res.callsign}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono-data">
                      {res.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded font-mono-data text-[10px] font-bold border uppercase ${getStatusBadgeColor(
                    res.status
                  )}`}
                >
                  {res.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Home Station:</span>
                  <span className="font-medium text-slate-800">{res.station}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Personnel & Payload:</span>
                  <span className="font-mono-data text-slate-800">
                    {res.personnelCount} crew • {res.equipmentSummary.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Battery / Fuel:</span>
                  <span className="font-mono-data text-emerald-700 font-bold">
                    {res.batteryOrFuelPercent}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Specialties:</span>
                  <span className="font-mono-data text-blue-700">
                    {res.specialties.join(' • ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Change Control */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-data">
                Status:
              </span>
              <select
                value={res.status}
                onChange={(e) => updateResourceStatus(res.id, e.target.value as UnitStatus)}
                className="px-2 py-1 text-xs border border-slate-200 rounded font-mono-data font-bold bg-slate-50 text-slate-800"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="EN_ROUTE">EN ROUTE</option>
                <option value="ON_SCENE">ON SCENE</option>
                <option value="RETURNING">RETURNING</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
