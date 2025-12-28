import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = '/api';

/**
 * Create Axios instance with default configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Get stored access token
 */
const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Get stored refresh token
 */
const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * Store tokens in localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Clear tokens from localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Check if we have a stored token
 */
export const hasStoredAuth = (): boolean => {
  return !!getAccessToken();
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
type RefreshResolve = (token: string | null) => void;
type RefreshReject = (error: AxiosError | Error) => void;

let failedQueue: Array<{
  resolve: RefreshResolve;
  reject: RefreshReject;
}> = [];

const processQueue = (error: AxiosError | Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request interceptor - add auth token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    throw error;
  }
);

/**
 * Response interceptor - handle errors and token refresh
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      return handleTokenRefresh(originalRequest);
    }

    throw error;
  }
);

/**
 * Handle token refresh flow. Extracted to reduce cognitive complexity in interceptor.
 */
async function handleTokenRefresh(originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) {
  if (isRefreshing) {
    return new Promise<AxiosResponse | null>((resolve, reject) => {
      failedQueue.push({ resolve: (token: string | null) => {
        if (token && originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
        resolve(apiClient(originalRequest));
        return token;
      }, reject });
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    window.location.href = '/login';
    isRefreshing = false;
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/users/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    setTokens(accessToken, newRefreshToken);

    processQueue(null, accessToken);

    if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return apiClient(originalRequest);
  } catch (err: unknown) {
    const refreshError: AxiosError | Error = axios.isAxiosError(err)
      ? err
      : err instanceof Error
      ? err
      : new Error(String(err));

    processQueue(refreshError, null);
    clearTokens();
    window.location.href = '/login';
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
}

export default apiClient;
