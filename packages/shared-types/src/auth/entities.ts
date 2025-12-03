import { UserRole } from "../user";

/**
 * Authentication data for a user
 */
export interface UserAuthData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string;
}
