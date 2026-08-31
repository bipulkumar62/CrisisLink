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
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-white" />;
    }
  };

  // Normalized map coordinates for visual simulation
  // Map bounds: Lat ~ 37.74 to 37.80, Lng ~ -122.46 to -122.38
  const toMapCoords = (lat: number, lng: number) => {
    const minLat = 37.74;
    const maxLat = 37.80;
    const minLng = -122.46;
    const maxLng = -122.38;

    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;

    return {
      top: `${Math.max(10, Math.min(90, y))}%`,
      left: `${Math.max(10, Math.min(90, x))}%`,
    };
  };

  return (
    <div
      className={`relative w-full ${
        fullHeight ? 'h-full min-h-[420px]' : 'h-[360px]'
      } bg-[#e9e5df] overflow-hidden select-none border-b lg:border-b-0 border-[#c4c6cd]/60`}
    >
      {/* Background Stylized Vector Urban Grid Canvas */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: selectedIncident
            ? `${toMapCoords(selectedIncident.location.latitude, selectedIncident.location.longitude).left} ${
                toMapCoords(selectedIncident.location.latitude, selectedIncident.location.longitude).top
              }`
            : 'center center',
        }}
      >
        {/* Stylized Urban Map Elements */}
        <svg
          className="w-full h-full object-cover opacity-85"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d5d0c7" strokeWidth="1" />
            </pattern>
            <pattern id="blocks" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect x="5" y="5" width="50" height="50" fill="#dfdad0" rx="3" />
              <rect x="65" y="5" width="50" height="50" fill="#e2ddd4" rx="3" />
              <rect x="5" y="65" width="50" height="50" fill="#e4dfd6" rx="3" />
              <rect x="65" y="65" width="50" height="50" fill="#ddd7cd" rx="3" />
            </pattern>
          </defs>

          {/* Base terrain */}
          <rect width="1000" height="700" fill="#eae6e0" />
          <rect width="1000" height="700" fill="url(#blocks)" />
          <rect width="1000" height="700" fill="url(#grid)" opacity="0.6" />

          {/* River / Bay channel */}
          <path
            d="M -50 480 Q 250 420, 500 520 T 1050 460 L 1050 750 L -50 750 Z"
            fill="#cadce8"
            opacity="0.9"
          />
          <path
            d="M 320 -20 Q 340 200, 480 340 T 520 720"
            fill="none"
            stroke="#cadce8"
            strokeWidth="36"
            opacity="0.8"
          />

          {/* Major Arterial Highways & Bridges */}
          <path
            d="M -50 220 L 1050 280"
            fill="none"
            stroke="#fefefe"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M -50 220 L 1050 280"
            fill="none"
            stroke="#f09a3e"
            strokeWidth="2"
            strokeDasharray="8 6"
          />

          <path
            d="M 680 -50 L 580 750"
            fill="none"
            stroke="#fefefe"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 220 -50 L 380 750"
            fill="none"
            stroke="#fefefe"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Secondary streets */}
          <line x1="0" y1="120" x2="1000" y2="120" stroke="#fefefe" strokeWidth="6" />
          <line x1="0" y1="360" x2="1000" y2="360" stroke="#fefefe" strokeWidth="7" />
          <line x1="0" y1="440" x2="1000" y2="440" stroke="#fefefe" strokeWidth="6" />
          <line x1="450" y1="0" x2="450" y2="700" stroke="#fefefe" strokeWidth="6" />
          <line x1="820" y1="0" x2="820" y2="700" stroke="#fefefe" strokeWidth="6" />
          <line x1="150" y1="0" x2="150" y2="700" stroke="#fefefe" strokeWidth="6" />

          {/* District labels */}
          <text x="180" y="80" fill="#8f8c85" fontSize="13" fontFamily="Inter" fontWeight="600" letterSpacing="2">
            SECTOR 3 - NORTH HIGHWAY
          </text>
          <text x="490" y="240" fill="#8f8c85" fontSize="14" fontFamily="Inter" fontWeight="700" letterSpacing="3">
            SECTOR 7 - DOWNTOWN CIVIC GRID
          </text>
          <text x="160" y="410" fill="#8f8c85" fontSize="13" fontFamily="Inter" fontWeight="600" letterSpacing="2">
            SECTOR 4 - CENTRAL HEIGHTS
          </text>
          <text x="680" y="580" fill="#8f8c85" fontSize="13" fontFamily="Inter" fontWeight="600" letterSpacing="2">
            SECTOR 9 - INDUSTRIAL PORT
          </text>
        </svg>

        {/* Dynamic Evacuation / Hazard Radii */}
        {showEvacuationZones &&
          incidents
            .filter((inc) => inc.status !== 'RESOLVED' && inc.evacuationRadiusMeters)
            .map((inc) => {
              const coords = toMapCoords(inc.location.latitude, inc.location.longitude);
              const isSelected = selectedIncident?.id === inc.id;
              const radiusSize = inc.severity === 'CRITICAL' ? 'w-48 h-48' : 'w-32 h-32';

              return (
                <div
                  key={`radius-${inc.id}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-300 ${radiusSize} ${
                    inc.severity === 'CRITICAL'
                      ? 'bg-red-500/15 border-2 border-red-500/40'
                      : 'bg-amber-500/15 border-2 border-amber-500/40'
                  } ${isSelected ? 'ring-4 ring-blue-500/30' : ''}`}
                  style={{ top: coords.top, left: coords.left }}
                >
                  <div
                    className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                      inc.severity === 'CRITICAL' ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                  />
                </div>
              );
            })}

        {/* Resource Markers */}
        {showUnits &&
          resources.map((res) => {
            const coords = toMapCoords(res.latitude, res.longitude);
            const isRescue = res.type === 'RESCUE_TEAM';
            const isAmbulance = res.type === 'AMBULANCE';

            return (
              <div
                key={`res-${res.id}`}
                onClick={() => onSelectResource && onSelectResource(res)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                style={{ top: coords.top, left: coords.left }}
              >
                {/* Unit shape */}
                {isRescue ? (
                  <div className="w-5 h-5 bg-[#0051d5] rotate-45 border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125">
                    <Shield className="w-2.5 h-2.5 text-white -rotate-45" />
                  </div>
                ) : isAmbulance ? (
                  <div className="w-5 h-5 rounded-xs bg-[#059669] border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125">
                    <HeartPulse className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded bg-[#d97706] border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125">
                    <span className="text-[8px] font-bold text-white font-mono-data">E</span>
                  </div>
                )}

                {/* Hover Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0b1f33] text-white px-2 py-0.5 rounded text-[10px] font-mono-data whitespace-nowrap shadow-md pointer-events-none z-30">
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

            let markerBg = 'bg-[#0051d5]';
            if (isCritical) markerBg = 'bg-[#ba1a1a]';
            else if (isHigh) markerBg = 'bg-[#d97706]';

            return (
              <div
                key={`inc-${inc.id}`}
                onClick={() => onSelectIncident(inc)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center cursor-pointer transition-all ${
                  isSelected ? 'scale-115 z-40' : 'hover:scale-110'
                }`}
                style={{ top: coords.top, left: coords.left }}
              >
                {/* Code Tag */}
                <div
                  className={`px-2 py-0.5 rounded shadow-sm border mb-1 flex items-center gap-1 font-mono-data text-[10px] font-bold transition-colors ${
                    isSelected
                      ? 'bg-[#0b1f33] text-white border-[#0b1f33] ring-2 ring-blue-400'
                      : 'bg-white text-[#1b1c1d] border-[#c4c6cd]'
                  }`}
                >
                  <span>{inc.code}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                  )}
                </div>

                {/* Pin Circle */}
                <div
                  className={`w-7 h-7 rounded-full border-2 border-white ${markerBg} flex items-center justify-center relative shadow-lg`}
                >
                  {getIncidentIcon(inc.category)}

                  {/* Pulsing ring for critical/high */}
                  {(isCritical || isHigh) && (
                    <div
                      className={`absolute -inset-1 rounded-full animate-ping opacity-60 ${
                        isCritical ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Map Action Controls (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
        <button
          onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
          title="Zoom In"
          className="w-8 h-8 bg-white rounded shadow-sm border border-[#c4c6cd] flex items-center justify-center text-[#44474c] hover:text-[#00050e] hover:bg-slate-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.25))}
          title="Zoom Out"
          className="w-8 h-8 bg-white rounded shadow-sm border border-[#c4c6cd] flex items-center justify-center text-[#44474c] hover:text-[#00050e] hover:bg-slate-50 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          title="Center Grid"
          className="w-8 h-8 mt-1 bg-white rounded shadow-sm border border-[#c4c6cd] flex items-center justify-center text-[#44474c] hover:text-[#00050e] hover:bg-slate-50 transition-colors"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Map Layers Toggle (Top Left) */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowEvacuationZones((v) => !v)}
          className={`px-2.5 py-1 rounded text-xs font-semibold border flex items-center gap-1.5 backdrop-blur-xs transition-colors shadow-2xs ${
            showEvacuationZones
              ? 'bg-white/95 text-[#00050e] border-[#c4c6cd]'
              : 'bg-slate-200/80 text-slate-500 border-slate-300 line-through'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#0051d5]" />
          <span>Evacuation Perimeters</span>
        </button>
        <button
          onClick={() => setShowUnits((v) => !v)}
          className={`px-2.5 py-1 rounded text-xs font-semibold border flex items-center gap-1.5 backdrop-blur-xs transition-colors shadow-2xs ${
            showUnits
              ? 'bg-white/95 text-[#00050e] border-[#c4c6cd]'
              : 'bg-slate-200/80 text-slate-500 border-slate-300 line-through'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Units & Fleet</span>
        </button>
      </div>

      {/* Map Legend (Bottom Left matching Image 1.png) */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded shadow-sm border border-[#c4c6cd] z-40">
        <h5 className="text-[10px] font-bold text-[#74777d] uppercase tracking-wider mb-2">
          Tactical Legend
        </h5>
        <div className="flex flex-col gap-2 font-mono-data text-[11px] text-[#1b1c1d]">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full border border-white bg-[#ba1a1a] flex items-center justify-center relative shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            </div>
            <span>Critical Incident</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#0051d5] rotate-45 border border-white shadow-xs"></div>
            <span>Rescue Unit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-xs bg-[#059669] border border-white shadow-xs flex items-center justify-center">
              <HeartPulse className="w-2.5 h-2.5 text-white" />
            </div>
            <span>Ambulance / EMS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
