import { AuthUser, UserRole } from '@/src/types/auth';

export interface IAuthService {
  loginDemo(role: UserRole): Promise<AuthUser>;
  loginWithCredentials(badgeOrEmail: string, pass: string): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}
