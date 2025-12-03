import { UserAuthData } from "./entities";

/**
 * General authentication response with user data and access token
 */
export interface AuthResponse {
  user: UserAuthData;
  accessToken: string;
}

/**
 * Login response with user data and access token
 * (Keep for backward compatibility)
 */
export interface LoginResponse {
  user: UserAuthData;
  accessToken: string;
}

/**
 * Google login response
 * (Keep for backward compatibility)
 */
export interface GoogleLoginResponse {
  user: UserAuthData;
  accessToken: string;
}
