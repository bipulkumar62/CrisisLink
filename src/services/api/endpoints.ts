/**
 * REST API Endpoints mapping for future FastAPI backend integration.
 */

export const API_ENDPOINTS = {
  INCIDENTS: {
    LIST: '/api/v1/incidents',
    DETAIL: (id: string) => `/api/v1/incidents/${id}`,
    BY_CODE: (code: string) => `/api/v1/incidents/code/${code}`,
    UPDATE_STATUS: (id: string) => `/api/v1/incidents/${id}/status`,
    ASSIGN_RESOURCE: (id: string) => `/api/v1/incidents/${id}/resources`,
  },
  REPORTS: {
    SUBMIT: '/api/v1/reports',
    LIST: '/api/v1/reports',
    TRACK: (token: string) => `/api/v1/reports/track/${token}`,
    CLUSTER: (id: string) => `/api/v1/reports/${id}/cluster`,
  },
  RESOURCES: {
    LIST: '/api/v1/resources',
    DETAIL: (id: string) => `/api/v1/resources/${id}`,
    UPDATE_STATUS: (id: string) => `/api/v1/resources/${id}/status`,
  },
  SYSTEM: {
    TELEMETRY: '/api/v1/system/telemetry',
    STATUS: '/api/v1/system/status',
  },
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    ME: '/api/v1/auth/me',
  },
} as const;
