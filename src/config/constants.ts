/**
 * Global application constants, branding, and navigation routes.
 */

export const APP_CONFIG = {
  NAME: 'CrisisLink',
  SUBTITLE: 'Emergency Intelligence & Response Coordination Platform',
  VERSION: '1.0.0-foundation',
  HOTLINE_EMERGENCY: '911',
  HOTLINE_NON_EMERGENCY: '311',
  HOTLINE_CRISIS_TEXT: 'Text HOME to 741741',
  DEFAULT_MAP_CENTER: { lat: 37.7749, lng: -122.4194 }, // Operational Sector Grid (SF/Bay Grid Prototype)
  DEFAULT_ZOOM: 13,
} as const;

export type RoutePath =
  // Public Citizen Portal
  | 'citizen-landing'
  | 'citizen-report'
  | 'citizen-live'
  | 'citizen-incident-detail'
  | 'citizen-confirmation'
  | 'citizen-status'
  // Protected Command Center
  | 'command-login'
  | 'command-dashboard'
  | 'command-incidents'
  | 'command-incident-detail'
  | 'command-reports'
  | 'command-resources'
  | 'command-map'
  | 'command-status';
