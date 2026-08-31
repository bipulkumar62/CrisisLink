/**
 * Authentication & Operator Session Types (Mock/Pluggable)
 */

export type UserRole = 'INCIDENT_COMMANDER' | 'DISPATCHER' | 'RESOURCE_COORDINATOR' | 'PUBLIC_OBSERVER';

export interface AuthUser {
  id: string;
  name: string;
  badgeNumber: string;
  role: UserRole;
  agency: string;
  sectorAccess: string[];
}

export interface SessionState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  mode: 'DEMO' | 'CONNECTED';
}
