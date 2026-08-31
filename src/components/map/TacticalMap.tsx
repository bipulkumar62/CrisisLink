import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Flame,
  Droplets,
  AlertTriangle,
  Zap,
  Shield,
  Layers,
  HeartPulse,
  Radio,
  Eye,
  Navigation
} from 'lucide-react';
import { Incident } from '@/src/types/incident';
import { ResourceUnit } from '@/src/types/resource';
import { APP_CONFIG } from '@/src/config/constants';

interface TacticalMapProps {
  incidents: Incident[];
  resources: ResourceUnit[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onSelectResource?: (resource: ResourceUnit) => void;
  fullHeight?: boolean;
}

// Map Updater Component to handle programmatic panning
const MapUpdater: React.FC<{ selectedIncident: Incident | null }> = ({ selectedIncident }) => {
  const map = useMap();
  React.useEffect(() => {
    if (selectedIncident) {
      map.setView(
        [selectedIncident.location.latitude, selectedIncident.location.longitude],
        15,
        { animate: true }
      );
    }
  }, [selectedIncident, map]);
  return null;
};

// Custom Icon Generator using Lucide Icons
const createCustomIcon = (
  iconComponent: React.ReactElement,
  bgColorClass: string,
  pulseColorClass?: string,
  isSelected: boolean = false
) => {
  const html = `
    <div class="relative flex items-center justify-center transform transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
      <div class="w-8 h-8 rounded-full border-2 border-white ${bgColorClass} flex items-center justify-center shadow-md">
        ${renderToStaticMarkup(iconComponent)}
      </div>
      ${pulseColorClass ? `<div class="absolute -inset-1 rounded-full animate-ping opacity-50 ${pulseColorClass}"></div>` : ''}
    </div>
  `;
  
  return L.divIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createResourceIcon = (
  iconComponent: React.ReactElement,
  shapeClass: string,
  bgColorClass: string
) => {
  const html = `
    <div class="relative flex items-center justify-center group cursor-pointer">
      <div class="w-6 h-6 border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-125 ${bgColorClass} ${shapeClass}">
        ${renderToStaticMarkup(iconComponent)}
      </div>
    </div>
  `;
  
  return L.divIcon({
    html,
    className: 'custom-leaflet-resource-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export const TacticalMap: React.FC<TacticalMapProps> = ({
  incidents,
  resources,
  selectedIncident,
  onSelectIncident,
  onSelectResource,
  fullHeight = true,
}) => {
  const [showEvacuationZones, setShowEvacuationZones] = useState<boolean>(true);
  const [showUnits, setShowUnits] = useState<boolean>(true);

  // Default Center for Jaipur
  const mapCenter: [number, number] = [APP_CONFIG.DEFAULT_MAP_CENTER.lat, APP_CONFIG.DEFAULT_MAP_CENTER.lng];
  const defaultZoom = APP_CONFIG.DEFAULT_ZOOM;
  const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY;

  const getIncidentIconConfig = (category: string, severity: string, isSelected: boolean) => {
    let bgColor = 'bg-blue-600';
    let pulseColor = '';
    
    if (severity === 'CRITICAL') {
      bgColor = 'bg-red-600';
      pulseColor = 'bg-red-600';
    } else if (severity === 'HIGH') {
      bgColor = 'bg-amber-600';
      pulseColor = 'bg-amber-600';
    }

    let iconComp = <AlertTriangle className="w-4 h-4 text-white" />;
    switch (category) {
      case 'FLOOD': iconComp = <Droplets className="w-4 h-4 text-white" />; break;
      case 'FIRE': iconComp = <Flame className="w-4 h-4 text-white" />; break;
      case 'POWER_OUTAGE': iconComp = <Zap className="w-4 h-4 text-white" />; break;
    }

    return createCustomIcon(iconComp, bgColor, pulseColor, isSelected);
  };

  const getResourceIconConfig = (type: string) => {
    let bgColor = 'bg-amber-600';
    let shape = 'rounded-sm';
    let iconComp = <Flame className="w-3 h-3 text-white" />;

    if (type === 'RESCUE_TEAM') {
      bgColor = 'bg-blue-600';
      shape = 'rounded-none rotate-45';
      iconComp = <Shield className="w-3 h-3 text-white -rotate-45" />;
    } else if (type === 'AMBULANCE') {
      bgColor = 'bg-green-700';
      shape = 'rounded-sm';
      iconComp = <HeartPulse className="w-3 h-3 text-white" />;
    } else if (type === 'DRONE_RECON') {
      bgColor = 'bg-slate-900';
      shape = 'rounded-full';
      iconComp = <Radio className="w-3 h-3 text-blue-400" />;
    }

    return createResourceIcon(iconComp, shape, bgColor);
  };

  return (
    <div
      className={`relative w-full ${
        fullHeight ? 'h-full min-h-[440px]' : 'h-[360px]'
      } bg-slate-100 overflow-hidden select-none border border-slate-200`}
    >
      {!cartoApiKey && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-100/95 backdrop-blur-sm">
          <div className="text-center p-6 bg-white rounded-xl shadow-md border border-amber-200 max-w-sm">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900 font-mono-data mb-2">Map Configuration Required</h3>
            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              The CARTO basemap API key is missing. Please configure <code>VITE_CARTO_API_KEY</code> in your environment to enable tactical mapping.
            </p>
          </div>
        </div>
      )}

      <MapContainer 
        center={mapCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapUpdater selectedIncident={selectedIncident} />
        
        {/* Professional Light Tactical Basemap (Carto Voyager) */}
        {cartoApiKey && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${cartoApiKey}`}
            subdomains="abcd"
            maxZoom={20}
          />
        )}

        {/* Evacuation Zones (Circles) */}
        {showEvacuationZones &&
          incidents
            .filter((inc) => inc.status !== 'RESOLVED' && inc.evacuationRadiusMeters)
            .map((inc) => (
              <Circle
                key={`radius-${inc.id}`}
                center={[inc.location.latitude, inc.location.longitude]}
                radius={inc.evacuationRadiusMeters || 1000}
                pathOptions={{
                  color: inc.severity === 'CRITICAL' ? '#dc2626' : '#d97706',
                  fillColor: inc.severity === 'CRITICAL' ? '#dc2626' : '#d97706',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
            ))}

        {/* Dispatch Routes (Polylines) */}
        {showUnits &&
          incidents
            .filter((inc) => inc.status !== 'RESOLVED' && inc.assignedResourceIds.length > 0)
            .map((inc) => {
              const assigned = resources.filter(r => inc.assignedResourceIds.includes(r.id));
              return assigned.map(res => {
                // Dim the route if it's not the selected incident (when an incident is selected)
                const isSelected = selectedIncident?.id === inc.id;
                const dimRoute = selectedIncident && !isSelected;
                
                return (
                  <Polyline
                    key={`route-${inc.id}-${res.id}`}
                    positions={[
                      [inc.location.latitude, inc.location.longitude],
                      [res.latitude, res.longitude]
                    ]}
                    pathOptions={{
                      color: res.type === 'AMBULANCE' ? '#15803d' : '#2563eb',
                      weight: isSelected ? 3 : 2,
                      dashArray: '5, 8',
                      opacity: dimRoute ? 0.2 : 0.7
                    }}
                  />
                );
              });
            })}

        {/* Resources */}
        {showUnits &&
          resources.map((res) => (
            <Marker
              key={`res-${res.id}`}
              position={[res.latitude, res.longitude]}
              icon={getResourceIconConfig(res.type)}
              eventHandlers={{
                click: () => onSelectResource && onSelectResource(res)
              }}
            >
              <Popup className="font-mono-data text-xs">
                <div className="font-bold text-slate-900">{res.callsign}</div>
                <div className="text-slate-500">{res.status.replace('_', ' ')}</div>
              </Popup>
            </Marker>
          ))}

        {/* Incidents */}
        {incidents
          .filter((inc) => inc.status !== 'RESOLVED')
          .map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            return (
              <Marker
                key={`inc-${inc.id}`}
                position={[inc.location.latitude, inc.location.longitude]}
                icon={getIncidentIconConfig(inc.category, inc.severity, isSelected)}
                eventHandlers={{
                  click: () => onSelectIncident(inc)
                }}
                zIndexOffset={isSelected ? 1000 : 0}
              >
                <Popup className="font-mono-data">
                  <div className="font-bold text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block mb-1 border border-blue-200">
                    {inc.code}
                  </div>
                  <div className="font-heading font-bold text-sm text-slate-900">{inc.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{inc.location.address}</div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Custom UI Overlays (Outside of MapContainer for strict z-index control over leaflet elements) */}
      
      {/* Map Layers Toggle (Top Left) */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setShowEvacuationZones((v) => !v)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border flex items-center gap-1.5 transition-colors shadow-sm ${
            showEvacuationZones
              ? 'bg-white text-slate-900 border-slate-200'
              : 'bg-slate-100 text-slate-500 border-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Cordons</span>
        </button>
        <button
          onClick={() => setShowUnits((v) => !v)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border flex items-center gap-1.5 transition-colors shadow-sm ${
            showUnits
              ? 'bg-white text-slate-900 border-slate-200'
              : 'bg-slate-100 text-slate-500 border-slate-300'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-green-700" />
          <span className="hidden sm:inline">Fleet</span>
        </button>
      </div>

      {/* Map Tactical Legend (Bottom Left) */}
      <div className="absolute bottom-6 left-3 bg-white/90 backdrop-blur-sm p-3 rounded-md shadow-md border border-slate-200 z-20 pointer-events-none">
        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">
          Jaipur Tactical Grid
        </h5>
        <div className="flex flex-col gap-2 font-mono-data text-[11px] text-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-sm"></div>
            <span>Critical Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-600 border border-white shadow-sm"></div>
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rotate-45 border border-white shadow-sm"></div>
            <span>SDRF / Rescue Team</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-700 border border-white shadow-sm flex items-center justify-center">
              <HeartPulse className="w-2 h-2 text-white" />
            </div>
            <span>Ambulance / EMS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

