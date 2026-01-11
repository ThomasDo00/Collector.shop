import { apiClient } from './api/apiClient';
import type { ProductPreview } from '@/types';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  memberSince: string;
  role: string;
  status: string;
  salesCount: number;
  reviewCount: number;
  rating: number;
  responseRate: number;
  responseTime: string;
  isVerified: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  author: {
    username: string;
    avatarUrl?: string | null;
  };
}

export const userService = {
  /**
   * Get user profile by username
   */
  async getProfile(username: string): Promise<UserProfile> {
    const response = await apiClient.get(`/users/profile/${username}`);
    return response.data.data;
  },

  /**
   * Get user's product listings
   */
  async getListings(username: string, status?: string): Promise<ProductPreview[]> {
    const response = await apiClient.get(`/users/profile/${username}/listings`, {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  },

  /**
   * Get user's reviews
   */
  async getReviews(username: string): Promise<Review[]> {
    const response = await apiClient.get(`/users/profile/${username}/reviews`);
    return response.data.data;
  },
};
