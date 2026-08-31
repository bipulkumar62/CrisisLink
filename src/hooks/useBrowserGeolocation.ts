import { useState, useEffect, useCallback, useRef } from 'react';

export type GeolocationStatus =
  | 'IDLE'
  | 'LOCATING'
  | 'GRANTED'
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNSUPPORTED';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  address: string;
  neighborhood?: string;
  source: 'GPS' | 'MANUAL_MAP' | 'PRESET_SECTOR';
}

// Jaipur landmark reference grid for reverse geocoding
const JAIPUR_LANDMARKS = [
  { name: 'MI Road & Paanch Batti Circle', sector: 'Sector 3', lat: 26.918, lng: 75.815 },
  { name: 'Johari Bazaar, Walled City', sector: 'Sector 1', lat: 26.924, lng: 75.828 },
  { name: 'Mansarovar Metro Station Grid', sector: 'Sector 4', lat: 26.872, lng: 75.768 },
  { name: 'Vaishali Nagar Amrapali Circle', sector: 'Sector 5', lat: 26.905, lng: 75.742 },
  { name: 'Malviya Nagar & World Trade Park (WTP)', sector: 'Sector 7', lat: 26.853, lng: 75.805 },
  { name: 'Sitapura Industrial Area Phase III', sector: 'Sector 8', lat: 26.775, lng: 75.832 },
  { name: 'Raja Park Commercial Avenue', sector: 'Sector 2', lat: 26.898, lng: 75.834 },
  { name: 'Jagatpura Railway Overbridge Area', sector: 'Sector 9', lat: 26.822, lng: 75.845 },
  { name: 'Sanganer Airport Environs', sector: 'Sector 6', lat: 26.828, lng: 75.805 },
  { name: 'Amer Fort Road Jal Mahal Corridor', sector: 'Sector 10', lat: 26.955, lng: 75.844 },
];

export function resolveNearestJaipurLandmark(lat: number, lng: number): { address: string; neighborhood: string } {
  let minDistance = Infinity;
  let closest = JAIPUR_LANDMARKS[0];

  for (const landmark of JAIPUR_LANDMARKS) {
    const d = Math.hypot(landmark.lat - lat, landmark.lng - lng);
    if (d < minDistance) {
      minDistance = d;
      closest = landmark;
    }
  }

  // If reasonably close to a landmark
  const latStr = lat.toFixed(4);
  const lngStr = lng.toFixed(4);
  return {
    address: `${closest.name}, Jaipur (${latStr}° N, ${lngStr}° E)`,
    neighborhood: closest.sector,
  };
}

export function useBrowserGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearPendingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const acquireGPS = useCallback(() => {
    clearPendingTimeout();
    setErrorMessage(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('UNSUPPORTED');
      setErrorMessage('Browser Geolocation API is not supported on this device/browser.');
      return;
    }

    setStatus('LOCATING');

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearPendingTimeout();
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // Check if inside or near Jaipur, otherwise resolve to nearest regional landmark
        const resolved = resolveNearestJaipurLandmark(lat, lng);

        const result: LocationResult = {
          latitude: lat,
          longitude: lng,
          accuracyMeters: Math.round(accuracy),
          address: resolved.address,
          neighborhood: resolved.neighborhood,
          source: 'GPS',
        };

        setLocation(result);
        setStatus('GRANTED');
      },
      (error) => {
        clearPendingTimeout();
        switch (error.code) {
          case error.PERMISSION_DENIED: // Code 1
            setStatus('PERMISSION_DENIED');
            setErrorMessage(
              'Location permission was denied. Please allow location access in your browser settings or select manually on the map below.'
            );
            break;
          case error.POSITION_UNAVAILABLE: // Code 2
            setStatus('POSITION_UNAVAILABLE');
            setErrorMessage(
              'Location information is temporarily unavailable from device GPS satellites. Please select your position on the map.'
            );
            break;
          case error.TIMEOUT: // Code 3
            setStatus('TIMEOUT');
            setErrorMessage(
              'GPS location request timed out. Please try again or pin your location manually on the map.'
            );
            break;
          default:
            setStatus('POSITION_UNAVAILABLE');
            setErrorMessage(error.message || 'An unknown error occurred while retrieving geolocation.');
            break;
        }
      },
      options
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lng: number, customAddress?: string) => {
    const resolved = resolveNearestJaipurLandmark(lat, lng);
    const result: LocationResult = {
      latitude: lat,
      longitude: lng,
      accuracyMeters: 5,
      address: customAddress || resolved.address,
      neighborhood: resolved.neighborhood,
      source: 'MANUAL_MAP',
    };
    setLocation(result);
    setStatus('GRANTED');
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    return () => {
      clearPendingTimeout();
    };
  }, []);

  return {
    status,
    errorMessage,
    location,
    acquireGPS,
    setManualLocation,
    resetLocation: () => {
      setLocation(null);
      setStatus('IDLE');
      setErrorMessage(null);
    },
  };
}
