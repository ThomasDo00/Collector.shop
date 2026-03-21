import { describe, it, expect, vi, beforeEach } from 'vitest';
import { favoritesService } from './favorites.service';
import { apiClient } from './api/client';

vi.mock('./api/client', () => {
  const mock = { get: vi.fn(), post: vi.fn(), delete: vi.fn() };
  return { apiClient: mock, default: mock };
});

describe('favoritesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('should fetch favorites successfully', async () => {
      const mockFavorites = [
        {
          id: 'prod-1',
          title: 'Jordan 1',
          price: 120,
          imageUrl: 'http://img/jordan.jpg',
          condition: 'like_new',
          status: 'active',
          isFavorite: true,
          seller: { id: 's1', username: 'john', avatarUrl: null },
          createdAt: '2024-01-15T00:00:00Z',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: mockFavorites } });

      const result = await favoritesService.getFavorites();

      expect(apiClient.get).toHaveBeenCalledWith('/favorites');
      expect(result).toEqual(mockFavorites);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no favorites', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });

      const result = await favoritesService.getFavorites();

      expect(result).toEqual([]);
    });

    it('should propagate errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Unauthorized'));

      await expect(favoritesService.getFavorites()).rejects.toThrow('Unauthorized');
    });
  });

  describe('addFavorite', () => {
    it('should add product to favorites', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      await favoritesService.addFavorite('prod-1');

      expect(apiClient.post).toHaveBeenCalledWith('/favorites', { productId: 'prod-1' });
    });

    it('should propagate errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Not found'));

      await expect(favoritesService.addFavorite('nonexistent')).rejects.toThrow('Not found');
    });
  });

  describe('removeFavorite', () => {
    it('should remove product from favorites', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: {} });

      await favoritesService.removeFavorite('prod-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/favorites/prod-1');
    });

    it('should propagate errors', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Server error'));

      await expect(favoritesService.removeFavorite('prod-1')).rejects.toThrow('Server error');
    });
  });
});
