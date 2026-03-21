import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/services/favorites.service', () => ({
  favoritesService: {
    getFavorites: vi.fn(),
    removeFavorite: vi.fn(),
  },
}));

vi.mock('@/core/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import FavoritesPage from './FavoritesPage';
import { favoritesService } from '@/services/favorites.service';

const mockFavorites = [
  {
    id: 'prod-1',
    title: 'Jordan 1 Retro High',
    price: 180,
    imageUrl: 'https://example.com/jordan.jpg',
    condition: 'like_new' as const,
    status: 'active' as const,
    isFavorite: true,
    seller: { id: 's-1', username: 'john', avatarUrl: null },
    createdAt: '2024-01-15T00:00:00Z',
    category: 'Sneakers',
  },
  {
    id: 'prod-2',
    title: 'Nike Air Max 90',
    price: 120,
    imageUrl: 'https://example.com/airmax.jpg',
    condition: 'good' as const,
    status: 'active' as const,
    isFavorite: true,
    seller: { id: 's-2', username: 'jane', avatarUrl: null },
    createdAt: '2024-01-20T00:00:00Z',
    category: 'Sneakers',
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <FavoritesPage />
    </MemoryRouter>,
  );

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
        favoritesService.getFavorites.mockResolvedValue([]);
    const { container } = renderPage();
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
        favoritesService.getFavorites.mockResolvedValue([]);
    renderPage();
    const body = document.body.textContent ?? '';
    expect(body).toContain('Mes favoris');
  });

  it('displays empty state when no favorites', async () => {
        favoritesService.getFavorites.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Aucun favori pour l\'instant');
    });
  });

  it('shows link to catalog in empty state', async () => {
        favoritesService.getFavorites.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Parcourir le catalogue');
    });
  });

  it('displays favorites when loaded', async () => {
        favoritesService.getFavorites.mockResolvedValue(mockFavorites);

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Jordan 1 Retro High');
      expect(body).toContain('Nike Air Max 90');
    });
  });

  it('shows item count', async () => {
        favoritesService.getFavorites.mockResolvedValue(mockFavorites);

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('2 articles');
    });
  });

  it('removes a favorite when button is clicked', async () => {
        favoritesService.getFavorites.mockResolvedValue([mockFavorites[0]]);
    favoritesService.removeFavorite.mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Jordan 1 Retro High');
    });

    const removeButtons = Array.from(document.querySelectorAll('button')).filter(
      (btn) => btn.textContent?.includes('Retirer des favoris'),
    );
    expect(removeButtons.length).toBeGreaterThan(0);
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(favoritesService.removeFavorite).toHaveBeenCalledWith('prod-1');
    });
  });

  it('handles error when loading favorites', async () => {
        favoritesService.getFavorites.mockRejectedValue(new Error('Network error'));

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Mes favoris');
    });
  });
});
