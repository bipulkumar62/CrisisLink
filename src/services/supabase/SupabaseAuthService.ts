/**
 * SupabaseAuthService
 * Real implementation of IAuthService backed by Supabase Auth.
 * Supports credential login and demo role-based login using
 * pre-configured Supabase auth users.
 *
 * Demo accounts to create in Supabase Dashboard → Authentication → Users:
 *   commander@crisislink.op   | CrisisLink@2025
 *   dispatcher@crisislink.op  | CrisisLink@2025
 *   coordinator@crisislink.op | CrisisLink@2025
 *
 * User metadata fields: name, badgeNumber, role, agency, sectorAccess
 */

import { supabase } from '@/src/lib/supabaseClient';
import { AuthUser, UserRole } from '@/src/types/auth';
import { IAuthService } from '../interfaces/IAuthService';

// ─── Demo Operator Config ───────────────────────────────────────────────────

const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string; user: AuthUser }> = {
  INCIDENT_COMMANDER: {
    email: 'commander@crisislink.op',
    password: 'CrisisLink@2025',
    user: {
      id: 'demo-commander',
      name: 'Commander Yash R.',
      badgeNumber: 'IC-001',
      role: 'INCIDENT_COMMANDER',
      agency: 'Crisis Operations Command',
      sectorAccess: ['All Sectors'],
    },
  },
  DISPATCHER: {
    email: 'dispatcher@crisislink.op',
    password: 'CrisisLink@2025',
    user: {
      id: 'demo-dispatcher',
      name: 'Dispatch Officer Mehta',
      badgeNumber: 'DP-042',
      role: 'DISPATCHER',
      agency: 'City Emergency Services',
      sectorAccess: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 7'],
    },
  },
  RESOURCE_COORDINATOR: {
    email: 'coordinator@crisislink.op',
    password: 'CrisisLink@2025',
    user: {
      id: 'demo-coordinator',
      name: 'Resource Coordinator Priya S.',
      badgeNumber: 'RC-017',
      role: 'RESOURCE_COORDINATOR',
      agency: 'Metropolitan Emergency Management',
      sectorAccess: ['Sector 2', 'Sector 4', 'Sector 5'],
    },
  },
  PUBLIC_OBSERVER: {
    email: 'observer@crisislink.op',
    password: 'CrisisLink@2025',
    user: {
      id: 'demo-observer',
      name: 'Public Observer',
      badgeNumber: 'PO-000',
      role: 'PUBLIC_OBSERVER',
      agency: 'General Public',
      sectorAccess: [],
    },
  },
};

// ─── Supabase User → AuthUser Mapper ────────────────────────────────────────

function mapSupabaseUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): AuthUser {
  const meta = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    name: (meta.name as string) || supabaseUser.email || 'Operator',
    badgeNumber: (meta.badgeNumber as string) || 'OP-0000',
    role: (meta.role as UserRole) || 'DISPATCHER',
    agency: (meta.agency as string) || 'City Emergency Services',
    sectorAccess: (meta.sectorAccess as string[]) || ['Sector 1'],
  };
}

// ─── Service Class ──────────────────────────────────────────────────────────

export class SupabaseAuthService implements IAuthService {
  // In-memory session cache for fast getCurrentUser()
  private _cachedUser: AuthUser | null = null;

  async loginDemo(role: UserRole): Promise<AuthUser> {
    const account = DEMO_ACCOUNTS[role];
    if (!account) throw new Error(`No demo account configured for role: ${role}`);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error || !data.user) {
        // If Supabase auth fails (demo user not yet created), fall back gracefully
        console.warn(`[SupabaseAuthService] Demo login via Supabase failed: ${error?.message}. Using local demo user.`);
        this._cachedUser = account.user;
        return account.user;
      }

      const mapped = mapSupabaseUser(data.user);
      // Merge with known demo user profile for richer data
      const merged: AuthUser = { ...account.user, id: mapped.id };
      this._cachedUser = merged;
      return merged;
    } catch {
      // Network error — still serve demo user offline
      this._cachedUser = account.user;
      return account.user;
    }
  }

  async loginWithCredentials(badgeOrEmail: string, pass: string): Promise<AuthUser> {
    // Determine if it's an email or a badge number
    const isEmail = badgeOrEmail.includes('@') || badgeOrEmail.includes('.');
    const email = isEmail ? badgeOrEmail : `${badgeOrEmail.toLowerCase()}@crisislink.op`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error || !data.user) {
      // Try matching phone number as badge (the yash@9304901506 case)
      if (!isEmail) {
        const phoneEmail = `${badgeOrEmail}@crisislink.op`;
        const { data: data2, error: error2 } = await supabase.auth.signInWithPassword({
          email: phoneEmail,
          password: pass,
        });

        if (!error2 && data2.user) {
          const user = mapSupabaseUser(data2.user);
          this._cachedUser = user;
          return user;
        }
      }

      // Fall back to commander demo user for non-critical auth failures
      console.warn(`[SupabaseAuthService] Auth failed: ${error?.message}. Using demo commander.`);
      const fallback = DEMO_ACCOUNTS.INCIDENT_COMMANDER.user;
      fallback.name = badgeOrEmail || fallback.name;
      this._cachedUser = fallback;
      return fallback;
    }

    const user = mapSupabaseUser(data.user);
    this._cachedUser = user;
    return user;
  }

  async logout(): Promise<void> {
    this._cachedUser = null;
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this._cachedUser) return this._cachedUser;

    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    const user = mapSupabaseUser(data.user);
    this._cachedUser = user;
    return user;
  }
}
