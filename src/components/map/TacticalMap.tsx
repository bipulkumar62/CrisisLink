import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Navigation,
  Flame,
  Droplets,
  AlertTriangle,
  Zap,
  Shield,
  Layers,
  HeartPulse,
  Radio,
  Eye,
} from 'lucide-react';
import { Incident } from '@/src/types/incident';
import { ResourceUnit } from '@/src/types/resource';

interface TacticalMapProps {
  incidents: Incident[];
  resources: ResourceUnit[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onSelectResource?: (resource: ResourceUnit) => void;
  fullHeight?: boolean;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  incidents,
  resources,
  selectedIncident,
  onSelectIncident,
  onSelectResource,
  fullHeight = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showEvacuationZones, setShowEvacuationZones] = useState<boolean>(true);
  const [showUnits, setShowUnits] = useState<boolean>(true);

  const getIncidentIcon = (category: string) => {
    switch (category) {
      case 'FLOOD':
        return <Droplets className="w-3.5 h-3.5 text-white" />;
      case 'FIRE':
        return <Flame className="w-3.5 h-3.5 text-white" />;
      case 'POWER_OUTAGE':
        return <Zap className="w-3.5 h-3.5 text-white" />;
      case 'STRUCTURE_COLLAPSE':
        return <AlertTriangle className="w-3.5 h-3.5 text-white" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-white" />;
    }
  };

  // Normalized map coordinates for Jaipur Municipality
  // Lat: 26.76 (Sitapura South) to 26.96 (Amer / Walled City North)
  // Lng: 75.72 (Vaishali West) to 75.86 (Ghat Gate / Ramganj East)
  const toMapCoords = (lat: number, lng: number) => {
    const minLat = 26.76;
    const maxLat = 26.96;
    const minLng = 75.72;
    const maxLng = 75.86;

    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;

    return {
      top: `${Math.max(8, Math.min(92, y))}%`,
      left: `${Math.max(8, Math.min(92, x))}%`,
    };
  };

  return (
    <div
      className={`relative w-full ${
        fullHeight ? 'h-full min-h-[440px]' : 'h-[360px]'
      } bg-[#e8ecf0] overflow-hidden select-none border border-[#D9E0E7]`}
    >
      {/* Background Vector Map Canvas for Jaipur City Grid */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: selectedIncident
            ? `${toMapCoords(selectedIncident.location.latitude, selectedIncident.location.longitude).left} ${
                toMapCoords(selectedIncident.location.latitude, selectedIncident.location.longitude).top
              }`
            : 'center center',
        }}
      >
        <svg
          className="w-full h-full object-cover opacity-90"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="jaipur-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#d5dde4" strokeWidth="0.8" />
            </pattern>
            <pattern id="urban-blocks" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect x="4" y="4" width="42" height="42" fill="#dce3ea" rx="2" />
              <rect x="52" y="4" width="42" height="42" fill="#e2e8ef" rx="2" />
              <rect x="4" y="52" width="42" height="42" fill="#e0e7ee" rx="2" />
              <rect x="52" y="52" width="42" height="42" fill="#d9e1e8" rx="2" />
            </pattern>
          </defs>

          {/* Base terrain */}
          <rect width="1000" height="700" fill="#eef2f6" />
          <rect width="1000" height="700" fill="url(#urban-blocks)" />
          <rect width="1000" height="700" fill="url(#jaipur-grid)" opacity="0.7" />

          {/* Jal Mahal & Aravalli Ridges (North) */}
          <path
            d="M 680 0 Q 720 100, 840 140 T 1000 120 L 1000 0 Z"
            fill="#b8d4e4"
            opacity="0.85"
          />
          <path
            d="M 0 0 Q 180 80, 240 160 L 0 180 Z"
            fill="#cdd8c5"
            opacity="0.6"
          />

          {/* Walled City Pink City Grid (North Center) */}
          <rect x="580" y="100" width="220" height="130" fill="#edd6d2" stroke="#d4a39b" strokeWidth="2" rx="4" />
          <line x1="690" y1="100" x2="690" y2="230" stroke="#fdfbf7" strokeWidth="6" />
          <line x1="580" y1="165" x2="800" y2="165" stroke="#fdfbf7" strokeWidth="6" />

          {/* Major Arterial Corridors in Jaipur */}
          {/* JLN Marg Corridor (North-South Axis) */}
          <path
            d="M 640 160 L 610 380 L 590 560"
            fill="none"
            stroke="#ffffff"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 640 160 L 610 380 L 590 560"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            opacity="0.8"
          />

          {/* MI Road & Ajmer Road (East-West Axis) */}
          <path
            d="M 120 280 L 480 240 L 820 220"
            fill="none"
            stroke="#ffffff"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M 120 280 L 480 240 L 820 220"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Tonk Road & Gopalpura Bypass */}
          <path
            d="M 520 220 L 560 460 L 680 700"
            fill="none"
            stroke="#ffffff"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 220 480 L 820 440"
            fill="none"
            stroke="#ffffff"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Secondary streets */}
          <line x1="80" y1="180" x2="950" y2="180" stroke="#ffffff" strokeWidth="5" />
          <line x1="50" y1="360" x2="950" y2="360" stroke="#ffffff" strokeWidth="5" />
          <line x1="300" y1="40" x2="300" y2="680" stroke="#ffffff" strokeWidth="6" />
          <line x1="440" y1="80" x2="440" y2="660" stroke="#ffffff" strokeWidth="5" />
          <line x1="760" y1="60" x2="760" y2="680" stroke="#ffffff" strokeWidth="5" />

          {/* District Sector Labels */}
          <text x="590" y="90" fill="#475569" fontSize="12" fontFamily="IBM Plex Sans" fontWeight="700" letterSpacing="1.5">
            SECTOR 1: WALLED CITY (PINK CITY)
          </text>
          <text x="360" y="225" fill="#475569" fontSize="11" fontFamily="IBM Plex Sans" fontWeight="700" letterSpacing="1">
            SECTOR 3: MI ROAD & PAANCH BATTI
          </text>
          <text x="130" y="270" fill="#475569" fontSize="11" fontFamily="IBM Plex Sans" fontWeight="700" letterSpacing="1">
            SECTOR 5: VAISHALI NAGAR
          </text>
          <text x="180" y="440" fill="#475569" fontSize="11" fontFamily="IBM Plex Sans" fontWeight="700" letterSpacing="1">
            SECTOR 4: MANSAROVAR METRO GRID
          </text>
          <text x="630" y="370" fill="#475569" fontSize="11" fontFamily="IBM Plex Sans" fontWeight="700" letterSpacing="1">
            SECTOR 7: JLN MARG / WTP
          </text>
          <text x="580" y="620" fill="#475569" fontSize="11" fontFamily="IBM Plex Sans" fontWeight="700" letterSpacing="1">
            SECTOR 8: SITAPURA INDUSTRIAL AREA
          </text>
        </svg>

        {/* Dynamic Evacuation & Safety Cordon Radii */}
        {showEvacuationZones &&
          incidents
            .filter((inc) => inc.status !== 'RESOLVED' && inc.evacuationRadiusMeters)
            .map((inc) => {
              const coords = toMapCoords(inc.location.latitude, inc.location.longitude);
              const isSelected = selectedIncident?.id === inc.id;
              const isCritical = inc.severity === 'CRITICAL';
              const radiusSize = isCritical ? 'w-44 h-44' : 'w-32 h-32';

              return (
                <div
                  key={`radius-${inc.id}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-200 ${radiusSize} ${
                    isCritical
                      ? 'bg-red-500/15 border-2 border-[#D92D20]/50'
                      : 'bg-amber-500/15 border-2 border-[#D97706]/50'
                  } ${isSelected ? 'ring-4 ring-[#2563EB]/40' : ''}`}
                  style={{ top: coords.top, left: coords.left }}
                >
                  <div
                    className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                      isCritical ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                  />
                </div>
              );
            })}

        {/* Resource Markers (First Responders) */}
        {showUnits &&
          resources.map((res) => {
            const coords = toMapCoords(res.latitude, res.longitude);
            const isRescue = res.type === 'RESCUE_TEAM';
            const isAmbulance = res.type === 'AMBULANCE';
            const isDrone = res.type === 'DRONE_RECON';

            return (
              <div
                key={`res-${res.id}`}
                onClick={() => onSelectResource && onSelectResource(res)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                style={{ top: coords.top, left: coords.left }}
              >
                {/* Tactical unit badge */}
                {isRescue ? (
                  <div className="w-5 h-5 bg-[#2563EB] rotate-45 border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-125">
                    <Shield className="w-2.5 h-2.5 text-white -rotate-45" />
                  </div>
                ) : isAmbulance ? (
                  <div className="w-5 h-5 rounded-xs bg-[#16803A] border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-125">
                    <HeartPulse className="w-3 h-3 text-white" />
                  </div>
                ) : isDrone ? (
                  <div className="w-5 h-5 rounded-full bg-[#0B1F33] border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-125">
                    <Radio className="w-2.5 h-2.5 text-blue-400" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded bg-[#D97706] border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-125">
                    <Flame className="w-2.5 h-2.5 text-white" />
                  </div>
                )}

                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0B1F33] text-white px-2 py-0.5 rounded text-[10px] font-mono-data whitespace-nowrap shadow-md pointer-events-none z-30">
                  {res.callsign} ({res.status.replace('_', ' ')})
                </div>
              </div>
            );
          })}

        {/* Incident Markers */}
        {incidents
          .filter((inc) => inc.status !== 'RESOLVED')
          .map((inc) => {
            const coords = toMapCoords(inc.location.latitude, inc.location.longitude);
            const isSelected = selectedIncident?.id === inc.id;
            const isCritical = inc.severity === 'CRITICAL';
            const isHigh = inc.severity === 'HIGH';

            let markerBg = 'bg-[#2563EB]';
            if (isCritical) markerBg = 'bg-[#D92D20]';
            else if (isHigh) markerBg = 'bg-[#D97706]';

            return (
              <div
                key={`inc-${inc.id}`}
                onClick={() => onSelectIncident(inc)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center cursor-pointer transition-all ${
                  isSelected ? 'scale-110 z-40' : 'hover:scale-105'
                }`}
                style={{ top: coords.top, left: coords.left }}
              >
                {/* Code Tag */}
                <div
                  className={`px-2 py-0.5 rounded shadow-sm border mb-1 flex items-center gap-1 font-mono-data text-[10px] font-bold transition-colors ${
                    isSelected
                      ? 'bg-[#0B1F33] text-white border-[#0B1F33] ring-2 ring-blue-400'
                      : 'bg-white text-[#101828] border-[#D9E0E7]'
                  }`}
                >
                  <span>{inc.code}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping"></span>
                  )}
                </div>

                {/* Pin Circle with category icon */}
                <div
                  className={`w-7 h-7 rounded-full border-2 border-white ${markerBg} flex items-center justify-center relative shadow-md`}
                >
                  {getIncidentIcon(inc.category)}

                  {/* Pulsing beacon for critical/high */}
                  {(isCritical || isHigh) && (
                    <div
                      className={`absolute -inset-1 rounded-full animate-ping opacity-50 ${
                        isCritical ? 'bg-[#D92D20]' : 'bg-[#D97706]'
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Map Action Controls (Top Right) */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-40">
        <button
          onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
          title="Zoom In"
          className="w-8 h-8 bg-white rounded shadow-xs border border-[#D9E0E7] flex items-center justify-center text-[#52606D] hover:text-[#101828] hover:bg-[#F7F8FA] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.25))}
          title="Zoom Out"
          className="w-8 h-8 bg-white rounded shadow-xs border border-[#D9E0E7] flex items-center justify-center text-[#52606D] hover:text-[#101828] hover:bg-[#F7F8FA] transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          title="Reset Jaipur Grid View"
          className="w-8 h-8 mt-1 bg-white rounded shadow-xs border border-[#D9E0E7] flex items-center justify-center text-[#52606D] hover:text-[#101828] hover:bg-[#F7F8FA] transition-colors"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Map Layers Toggle (Top Left) */}
      <div className="absolute top-3 left-3 z-40 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setShowEvacuationZones((v) => !v)}
          className={`px-2.5 py-1 rounded text-xs font-semibold border flex items-center gap-1.5 transition-colors shadow-2xs ${
            showEvacuationZones
              ? 'bg-white text-[#101828] border-[#D9E0E7]'
              : 'bg-slate-200/90 text-slate-500 border-slate-300 line-through'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="hidden sm:inline">Safety Perimeters</span>
          <span className="sm:hidden">Cordons</span>
        </button>
        <button
          onClick={() => setShowUnits((v) => !v)}
          className={`px-2.5 py-1 rounded text-xs font-semibold border flex items-center gap-1.5 transition-colors shadow-2xs ${
            showUnits
              ? 'bg-white text-[#101828] border-[#D9E0E7]'
              : 'bg-slate-200/90 text-slate-500 border-slate-300 line-through'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-[#16803A]" />
          <span className="hidden sm:inline">First Responders</span>
          <span className="sm:hidden">Fleet</span>
        </button>
      </div>

      {/* Map Tactical Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 bg-white p-2.5 rounded shadow-xs border border-[#D9E0E7] z-40">
        <h5 className="text-[10px] font-bold text-[#52606D] uppercase tracking-wider mb-1.5">
          Jaipur Tactical Grid
        </h5>
        <div className="flex flex-col gap-1.5 font-mono-data text-[11px] text-[#101828]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#D92D20] border border-white"></div>
            <span>Critical Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#D97706] border border-white"></div>
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#2563EB] rotate-45 border border-white"></div>
            <span>SDRF / Rescue Team</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-xs bg-[#16803A] border border-white flex items-center justify-center">
              <HeartPulse className="w-2 h-2 text-white" />
            </div>
            <span>Ambulance / EMS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
