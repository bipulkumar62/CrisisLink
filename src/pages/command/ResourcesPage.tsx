import React, { useState } from 'react';
import {
  Truck,
  Shield,
  Ambulance,
  Flame,
  Building2,
  Search,
  CheckCircle,
  Radio,
  MapPin,
  Clock,
  BatteryCharging,
  Layers,
  Phone,
  User,
  Activity,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { UnitStatus, UnitType, ResourceUnit } from '@/src/types/resource';
import { ResourceGridSkeleton } from '@/src/components/common/SkeletonLoaders';

interface ResourcesPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onNavigate }) => {
  const { resources, updateResourceStatus, isLoading } = useEmergencyData();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (isLoading) {
    return <ResourceGridSkeleton />;
  }

  const filteredResources = resources.filter((res) => {
    // Type filter matching
    if (typeFilter === 'AMBULANCE' && res.type !== 'AMBULANCE') return false;
    if (typeFilter === 'RESCUE_TEAM' && res.type !== 'RESCUE_TEAM') return false;
    if (typeFilter === 'FIRE_UNIT' && res.type !== 'FIRE_UNIT' && res.type !== 'FIRE_ENGINE') return false;
    if (typeFilter === 'SHELTER' && res.type !== 'SHELTER') return false;

    // Status filter matching
    if (statusFilter === 'AVAILABLE' && res.status !== 'AVAILABLE') return false;
    if (statusFilter === 'ASSIGNED' && res.status !== 'ASSIGNED' && res.status !== 'EN_ROUTE') return false;
    if (statusFilter === 'BUSY' && res.status !== 'BUSY' && res.status !== 'ON_SCENE') return false;
    if (statusFilter === 'OFFLINE' && res.status !== 'OFFLINE' && res.status !== 'MAINTENANCE') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.callsign.toLowerCase().includes(q) ||
        (res.name && res.name.toLowerCase().includes(q)) ||
        res.station.toLowerCase().includes(q) ||
        res.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: UnitStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-2 py-0.5 rounded font-mono-data text-[10px] font-bold border uppercase bg-emerald-50 text-[#16803A] border-emerald-200">
            AVAILABLE
          </span>
        );
      case 'ASSIGNED':
      case 'EN_ROUTE':
        return (
          <span className="px-2 py-0.5 rounded font-mono-data text-[10px] font-bold border uppercase bg-blue-50 text-[#2563EB] border-blue-200">
            ASSIGNED
          </span>
        );
      case 'BUSY':
      case 'ON_SCENE':
        return (
          <span className="px-2 py-0.5 rounded font-mono-data text-[10px] font-bold border uppercase bg-amber-50 text-[#D97706] border-amber-200">
            BUSY
          </span>
        );
      case 'OFFLINE':
      case 'MAINTENANCE':
      case 'RETURNING':
      default:
        return (
          <span className="px-2 py-0.5 rounded font-mono-data text-[10px] font-bold border uppercase bg-slate-100 text-slate-600 border-slate-300">
            OFFLINE
          </span>
        );
    }
  };

  const getTypeIcon = (type: UnitType) => {
    switch (type) {
      case 'AMBULANCE':
        return <Ambulance className="w-4 h-4 text-red-600" />;
      case 'RESCUE_TEAM':
        return <Shield className="w-4 h-4 text-amber-600" />;
      case 'FIRE_UNIT':
      case 'FIRE_ENGINE':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'SHELTER':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Truck className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 p-4 lg:p-6 bg-[#F7F8FA] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E0E7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16803A] animate-pulse"></span>
            <span className="text-xs font-bold font-mono-data text-[#16803A] uppercase tracking-wider">
              CAD Tactical Fleet & Relief Shelters
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#101828] font-heading tracking-tight">
            Resource Allocation & Fleet Manager
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Monitor real-time status across Ambulances, Rescue Teams, Fire Units, and Evacuation Shelters in Jaipur.
          </p>
        </div>

        {/* Global summary counters */}
        <div className="flex items-center gap-3 text-xs font-mono-data bg-white p-3 border border-[#D9E0E7] rounded-xl shadow-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Available:</span>
            <span className="font-bold text-[#16803A] text-sm">
              {resources.filter((r) => r.status === 'AVAILABLE').length} Units
            </span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned / Busy:</span>
            <span className="font-bold text-[#2563EB] text-sm">
              {resources.filter((r) => r.status === 'ASSIGNED' || r.status === 'BUSY' || r.status === 'EN_ROUTE' || r.status === 'ON_SCENE').length} Units
            </span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Shelters Open:</span>
            <span className="font-bold text-emerald-700 text-sm">
              {resources.filter((r) => r.type === 'SHELTER').length} Relief Hubs
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-3.5 border border-[#D9E0E7] rounded-xl shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by callsign (EMS-01, SDRF-02, SHELTER-01), station, or capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded font-mono-data focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden"
          />
        </div>

        {/* Resource Type Filter Chips */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-2.5 py-1.5 rounded text-xs font-mono-data font-bold whitespace-nowrap transition-colors ${
              typeFilter === 'ALL'
                ? 'bg-[#0B1F33] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('AMBULANCE')}
            className={`px-2.5 py-1.5 rounded text-xs font-mono-data font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
              typeFilter === 'AMBULANCE'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Ambulance className="w-3.5 h-3.5" /> Ambulance
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('RESCUE_TEAM')}
            className={`px-2.5 py-1.5 rounded text-xs font-mono-data font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
              typeFilter === 'RESCUE_TEAM'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Rescue Team
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('FIRE_UNIT')}
            className={`px-2.5 py-1.5 rounded text-xs font-mono-data font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
              typeFilter === 'FIRE_UNIT'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Fire Unit
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('SHELTER')}
            className={`px-2.5 py-1.5 rounded text-xs font-mono-data font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
              typeFilter === 'SHELTER'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Shelter
          </button>
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded bg-white font-mono-data font-bold text-slate-800 w-full md:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="BUSY">BUSY</option>
          <option value="OFFLINE">OFFLINE</option>
        </select>
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const isShelter = res.type === 'SHELTER';
          const occupancyPercent = isShelter && res.capacityBeds ? Math.round(((res.occupancyCurrent || 0) / res.capacityBeds) * 100) : 0;

          return (
            <div
              key={res.id}
              className="bg-white border border-[#D9E0E7] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-500 transition-colors"
            >
              <div className="space-y-3">
                {/* Card Top */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                      {getTypeIcon(res.type)}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-[#101828] leading-tight">
                        {res.callsign}
                      </h3>
                      <span className="text-[10px] text-[#52606D] font-mono-data block">
                        {res.name || res.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {getStatusBadge(res.status)}
                </div>

                {/* Details Table */}
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400 font-mono-data text-[11px]">Location / Base:</span>
                    <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">{res.station}</span>
                  </div>

                  {/* Shelter specific fields */}
                  {isShelter ? (
                    <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded space-y-1.5 font-mono-data text-[11px]">
                      <div className="flex justify-between text-emerald-950 font-bold">
                        <span>Bed Capacity:</span>
                        <span>{res.occupancyCurrent} / {res.capacityBeds} ({occupancyPercent}% full)</span>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                      {res.contactNumber && (
                        <div className="flex items-center justify-between text-slate-600 pt-1">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-700" /> Helpline:</span>
                          <span className="font-bold">{res.contactNumber}</span>
                        </div>
                      )}
                      {res.shelterManager && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1"><User className="w-3 h-3 text-emerald-700" /> In-Charge:</span>
                          <span className="truncate max-w-[140px]">{res.shelterManager}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-400 font-mono-data text-[11px]">Crew & Gear:</span>
                        <span className="font-mono-data text-slate-900">
                          {res.personnelCount} crew • {res.equipmentSummary.slice(0, 2).join(', ')}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-400 font-mono-data text-[11px]">Fuel / Battery:</span>
                        <span className="font-mono-data font-bold text-slate-900 flex items-center gap-1">
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                          {res.batteryOrFuelPercent}%
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400 font-mono-data text-[11px]">Specialties:</span>
                    <span className="font-mono-data text-blue-700 text-right text-[11px] font-semibold truncate max-w-[180px]">
                      {res.specialties.join(' • ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Control Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-data">
                  Update Unit Status:
                </span>
                <select
                  value={res.status}
                  onChange={(e) => updateResourceStatus(res.id, e.target.value as UnitStatus)}
                  className="px-2.5 py-1 text-xs border border-slate-300 rounded font-mono-data font-bold bg-slate-50 text-slate-900 cursor-pointer"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="BUSY">BUSY</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
