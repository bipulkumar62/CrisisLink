/**
 * Global application constants, branding, and navigation routes.
 * Geographically focused on Jaipur, Rajasthan Municipal Grid.
 */

export const APP_CONFIG = {
  NAME: 'CrisisLink',
  SUBTITLE: 'Emergency Intelligence & Response Coordination Platform',
  VERSION: '2.0.0-prototype',
  REGION_LABEL: 'Prototype Simulation — Jaipur, Rajasthan',
  HOTLINE_EMERGENCY: '112', // Unified National Emergency Number (India)
  HOTLINE_POLICE: '100',
  HOTLINE_FIRE: '101',
  HOTLINE_AMBULANCE: '108',
  HOTLINE_DISASTER: '1070', // Rajasthan State Disaster Management Helpline
  DEFAULT_MAP_CENTER: { lat: 26.9124, lng: 75.7873 }, // Jaipur Central (MI Road / C-Scheme)
  DEFAULT_ZOOM: 13,
  JAIPUR_SECTORS: [
    'Sector 1 - Walled City (Pink City / Johari Bazaar)',
    'Sector 2 - C-Scheme & Ashok Nagar',
    'Sector 3 - MI Road & Paanch Batti',
    'Sector 4 - Mansarovar (Metro & Residential Grid)',
    'Sector 5 - Vaishali Nagar & Amrapali Circle',
    'Sector 6 - Malviya Nagar & Gaurav Tower Area',
    'Sector 7 - JLN Marg & SMS Hospital Corridor',
    'Sector 8 - Sitapura Industrial Area Phase I-IV',
    'Sector 9 - Sanganer & Airport Perimeter',
    'Sector 10 - Amer Road & Jal Mahal Basin',
  ],
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
