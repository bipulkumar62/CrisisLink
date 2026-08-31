/**
 * MapLibreBasemap — A React-Leaflet v5 component that renders
 * an OpenFreeMap vector-tile basemap via MapLibre GL inside Leaflet.
 *
 * Uses @maplibre/maplibre-gl-leaflet to bridge the two libraries.
 * No API key required.
 */

import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreBasemapProps {
  /** Full URL to a MapLibre-compatible style JSON (e.g. OpenFreeMap Positron) */
  styleUrl: string;
}

export const MapLibreBasemap: React.FC<MapLibreBasemapProps> = ({ styleUrl }) => {
  const map = useMap();

  useEffect(() => {
    const glLayer = L.maplibreGL({
      style: styleUrl,
      attribution:
        '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    } as any);

    glLayer.addTo(map);

    return () => {
      map.removeLayer(glLayer);
    };
  }, [map, styleUrl]);

  return null;
};
