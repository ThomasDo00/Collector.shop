import apiClient, { setTokens, clearTokens, hasStoredAuth } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types';

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login user with email/username and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    const { accessToken, refreshToken } = response.data.data;

    // Store tokens
    setTokens(accessToken, refreshToken);

    return response.data.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    return response.data.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });

    const tokens = response.data.data;
    setTokens(tokens.accessToken, tokens.refreshToken);

    return tokens;
  },

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore errors on logout
    } finally {
      clearTokens();
    }
  },

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  /**
   * Check if user has stored authentication
   */
  hasAuth(): boolean {
    return hasStoredAuth();
  },

  /**
   * Clear stored authentication
   */
  clearAuth(): void {
    clearTokens();
  },
};

export default authService;
