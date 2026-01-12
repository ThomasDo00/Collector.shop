import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from './user.service';
import { apiClient } from './api/client';

vi.mock('./api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockProfile },
      });

      const result = await userService.getProfile('testuser');

      expect(apiClient.get).toHaveBeenCalledWith('/users/profile/testuser');
      expect(result).toEqual(mockProfile);
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(userService.getProfile('testuser')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getListings', () => {
    it('should fetch user listings successfully', async () => {
      const mockListings = [
        { id: '1', title: 'Product 1' },
        { id: '2', title: 'Product 2' },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockListings },
      });

      const result = await userService.getListings('testuser');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/profile/testuser/listings',
        { params: undefined }
      );
      expect(result).toEqual(mockListings);
    });

    it('should filter listings by status', async () => {
      const mockListings = [{ id: '1', title: 'Product 1', status: 'active' }];

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockListings },
      });

      await userService.getListings('testuser', 'active');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/profile/testuser/listings',
        { params: { status: 'active' } }
      );
    });
  });

  describe('getReviews', () => {
    it('should fetch user reviews successfully', async () => {
      const mockReviews = [
        { id: '1', rating: 5, comment: 'Great!' },
        { id: '2', rating: 4, comment: 'Good' },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockReviews },
      });

      const result = await userService.getReviews('testuser');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/profile/testuser/reviews'
      );
      expect(result).toEqual(mockReviews);
    });
  });
});
