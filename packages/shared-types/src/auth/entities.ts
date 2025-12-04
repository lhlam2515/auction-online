import { UserRole, AccountStatus } from "../common/enums";

/**
 * Authentication data for a user
 */
export interface UserAuthData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  accountStatus: AccountStatus;
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Session data
 */
export interface SessionData {
  user: UserAuthData;
  accessToken: string;
  expiresAt: string;
}
