/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Error response from API
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Pagination response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * Login request payload
 */
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

/**
 * Login response from API
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
  };
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Register response from API
 */
export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
}

/**
 * User roles
 */
export type UserRole = 'visitor' | 'buyer' | 'seller' | 'admin';

/**
 * User status
 */
export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';
