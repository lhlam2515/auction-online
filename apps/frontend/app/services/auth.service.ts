import { apiClient } from "@/lib/handlers/api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ApiResponse,
} from "@repo/shared-types";

async function register(
  data: RegisterRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.auth.register,
    data
  );
  return response.data;
}

async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.auth.login,
    data
  );
  return response.data;
}

async function logout(): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.auth.logout
  );
  return response.data;
}

async function refreshToken(): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.auth.refreshToken
  );
  return response.data;
}

async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.auth.forgotPassword,
    data
  );
  return response.data;
}

async function verifyOtp(
  data: VerifyOtpRequest
): Promise<ApiResponse<{ token: string }>> {
  const response = await apiClient.post<ApiResponse<{ token: string }>>(
    API_ENDPOINTS.auth.verifyOtp,
    data
  );
  return response.data;
}

async function resetPassword(
  data: ResetPasswordRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.auth.resetPassword,
    data
  );
  return response.data;
}

async function googleLogin(token: string): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.auth.googleLogin,
    { token }
  );
  return response.data;
}

async function verifyEmail(
  data: VerifyEmailRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.auth.verifyEmail,
    data
  );
  return response.data;
}

async function resendVerification(
  data: ResendVerificationRequest
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.auth.resendVerification,
    data
  );
  return response.data;
}

export const AuthService = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
  googleLogin,
  verifyEmail,
  resendVerification,
};
