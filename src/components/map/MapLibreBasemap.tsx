/**
 * MapLibreBasemap — A React-Leaflet v5 component that renders
 * an OpenFreeMap vector-tile basemap via MapLibre GL inside Leaflet.
 *
 * Uses @maplibre/maplibre-gl-leaflet to bridge the two libraries.
 * No API key required.
 */

import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreBasemapProps {
  /** Full URL to a MapLibre-compatible style JSON (e.g. OpenFreeMap Positron) */
  styleUrl: string;
}

export const MapLibreBasemap: React.FC<MapLibreBasemapProps> = ({ styleUrl }) => {
  const map = useMap();
  const [pluginLoaded, setPluginLoaded] = useState(false);

  useEffect(() => {
    // Expose globals required by the maplibre-gl-leaflet plugin before importing it
    if (typeof window !== 'undefined') {
      (window as any).maplibregl = maplibregl;
      (window as any).L = L;
    }
    
    // Dynamically import to ensure it runs after globals are set
    import('@maplibre/maplibre-gl-leaflet').then(() => {
      setPluginLoaded(true);
    }).catch(err => {
      console.error("Failed to load maplibre-gl-leaflet plugin", err);
    });
  }, []);

  useEffect(() => {
    if (!pluginLoaded || !(L as any).maplibreGL) return;

    const glLayer = (L as any).maplibreGL({
      style: styleUrl,
      attribution:
        '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> contributors',
    });

    glLayer.addTo(map);

    return () => {
      if (map && glLayer) {
        map.removeLayer(glLayer);
      }
    };
  }, [map, styleUrl, pluginLoaded]);

  return null;
};
