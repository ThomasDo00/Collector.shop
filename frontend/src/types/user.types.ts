import type { UserRole, UserStatus } from './api.types';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * User profile with additional stats
 */
export interface UserProfile extends User {
  rating: number;
  reviewCount: number;
  salesCount: number;
  isTrustedSeller: boolean; // score > 4.5 with 20+ sales
  memberSince: string;
}

/**
 * Minimal user info for display in cards/lists
 */
export interface UserPreview {
  id: string;
  username: string;
  avatarUrl?: string;
  rating?: number;
  isTrustedSeller?: boolean;
}

/**
 * User settings
 */
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    newMessages: boolean;
    orderUpdates: boolean;
  };
  privacy: {
    showEmail: boolean;
    showLocation: boolean;
    showOnlineStatus: boolean;
  };
}

/**
 * User review
 */
export interface UserReview {
  id: string;
  reviewer: UserPreview;
  rating: number;
  comment: string;
  productId?: string;
  productTitle?: string;
  createdAt: string;
}

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
