import type { User } from "../user/entities";

/**
 * Login response with user data and access token
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
}

/**
 * Google login response
 */
export interface GoogleLoginResponse {
  user: User;
  accessToken: string;
}
