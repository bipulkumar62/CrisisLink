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

/**
 * Fetches and maps the operator profile from the database.
 * This is the core of the RBAC authorization model.
 */
async function fetchOperatorProfile(userId: string, authEmail?: string): Promise<AuthUser> {
  const { data, error } = await supabase
    .from('operator_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('Access Denied: You do not have an authorized operator profile.');
  }

  if (!data.is_active) {
    throw new Error('Access Denied: Your operator profile is currently inactive.');
  }

  return {
    id: userId,
    name: authEmail || 'Operator',
    badgeNumber: data.badge_number,
    role: data.role as UserRole,
    agency: data.agency,
    sectorAccess: ['All Sectors'], // Can be expanded in DB schema later
  };
}

export class SupabaseAuthService implements IAuthService {
  private _cachedUser: AuthUser | null = null;

  async loginDemo(role: UserRole): Promise<AuthUser> {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true') {
      throw new Error('Demo auth is currently unsupported in strict mode.');
    }
    throw new Error('Demo login is strictly disabled in production.');
  }

  async loginWithCredentials(email: string, pass: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error || !data.user) {
      throw new Error('Invalid credentials. Authentication failed.');
    }

    try {
      const user = await fetchOperatorProfile(data.user.id, data.user.email);
      this._cachedUser = user;
      return user;
    } catch (authzError: any) {
      // If authentication succeeded but authorization failed, we must sign them out
      await supabase.auth.signOut();
      throw authzError;
    }
  }

  async logout(): Promise<void> {
    this._cachedUser = null;
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this._cachedUser) return this._cachedUser;

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    try {
      const user = await fetchOperatorProfile(data.user.id, data.user.email);
      this._cachedUser = user;
      return user;
    } catch {
      // If they have a valid Supabase session but no role, they are unauthorized.
      // We do not auto-sign-out here in case they are a public citizen user using the same auth pool,
      // but they will be denied Command Center access.
      return null;
    }
  }
}
