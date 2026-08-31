import { AuthUser, UserRole } from '@/src/types/auth';
import { IAuthService } from '../interfaces/IAuthService';
import { DEMO_OPERATORS } from './mockData';

export class MockAuthService implements IAuthService {
  private currentUser: AuthUser | null = DEMO_OPERATORS[0]; // Default to Commander for smooth triage demo

  async loginDemo(role: UserRole): Promise<AuthUser> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const user = DEMO_OPERATORS.find((op) => op.role === role) || {
      id: `usr-${role.toLowerCase()}`,
      name: `${role.replace('_', ' ')} Operator`,
      badgeNumber: 'DEMO-99',
      role,
      agency: 'Crisis Operations Command',
      sectorAccess: ['All Sectors'],
    };
    this.currentUser = user;
    return user;
  }

  async loginWithCredentials(badgeOrEmail: string, _pass: string): Promise<AuthUser> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const matched = DEMO_OPERATORS.find(
      (op) =>
        op.badgeNumber.toLowerCase() === badgeOrEmail.toLowerCase() ||
        op.name.toLowerCase().includes(badgeOrEmail.toLowerCase())
    );

    if (matched) {
      this.currentUser = matched;
      return matched;
    }

    // Dynamic demo login fallback
    const user: AuthUser = {
      id: `usr-custom-${Date.now()}`,
      name: badgeOrEmail || 'Duty Officer',
      badgeNumber: 'OP-5501',
      role: 'DISPATCHER',
      agency: 'City Emergency Services',
      sectorAccess: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 7'],
    };
    this.currentUser = user;
    return user;
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser;
  }
}
