import apiClient, { setTokens, clearTokens, hasStoredAuth } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  MfaSetupResponse,
  MfaLoginResult,
  NormalLoginResult,
} from '@/types';

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login user with email/username and password.
   * Returns either a full session (mfaRequired: false) or
   * a short-lived mfaToken when MFA is enabled (mfaRequired: true).
   */
  async login(credentials: LoginRequest): Promise<MfaLoginResult | NormalLoginResult> {
    const response = await apiClient.post<
      { success: boolean; mfaRequired: boolean; data: { mfaToken?: string; accessToken?: string; refreshToken?: string; user?: LoginResponse['user'] } }
    >(API_ENDPOINTS.AUTH.LOGIN, credentials);

    if (response.data.mfaRequired) {
      return { mfaRequired: true, mfaToken: response.data.data.mfaToken! };
    }

    const { accessToken, refreshToken, user } = response.data.data;
    setTokens(accessToken!, refreshToken!);
    return { mfaRequired: false, accessToken: accessToken!, refreshToken: refreshToken!, user: user! };
  },

  /**
   * Exchange a short-lived mfaToken + TOTP code for full access tokens.
   */
  async verifyMfaLogin(mfaToken: string, totpCode: string): Promise<LoginResponse['user']> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.MFA.VERIFY_LOGIN,
      { mfaToken, totpCode }
    );
    const { accessToken, refreshToken, user } = response.data.data;
    setTokens(accessToken, refreshToken);
    return user;
  },

  /**
   * Generate a new TOTP secret and QR code (does not activate MFA yet).
   */
  async setupMfa(): Promise<MfaSetupResponse> {
    const response = await apiClient.post<ApiResponse<MfaSetupResponse>>(API_ENDPOINTS.MFA.SETUP);
    return response.data.data;
  },

  /**
   * Confirm MFA activation by verifying the first TOTP code.
   */
  async enableMfa(totpCode: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.MFA.ENABLE, { totpCode });
  },

  /**
   * Disable MFA after verifying the current TOTP code.
   */
  async disableMfa(totpCode: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.MFA.DISABLE, { totpCode });
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
