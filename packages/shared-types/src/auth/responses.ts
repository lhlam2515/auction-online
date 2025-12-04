import { UserAuthData } from "./entities";

/**
 * Login response with user data and access token
 * Refresh token is sent via HttpOnly cookie for security
 */
export interface LoginResponse {
  user: UserAuthData;
  accessToken: string;
}

/**
 * Refresh token response with new access token
 * Refresh token is sent via HttpOnly cookie for security
 */
export interface RefreshResponse {
  accessToken: string;
}
