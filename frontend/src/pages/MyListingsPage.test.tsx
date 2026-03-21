import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';

vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.mock('@/core/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import MyListingsPage from './MyListingsPage';
import { apiClient } from '@/services/api/client';

const mockListings = [
  {
    id: 'prod-1',
    title: 'Jordan 1 Retro High OG',
    price: 180,
    imageUrl: 'https://example.com/jordan.jpg',
    condition: 'like_new',
    status: 'active',
    category: 'Sneakers',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'prod-2',
    title: 'Nike Air Force 1',
    price: 90,
    imageUrl: 'https://example.com/af1.jpg',
    condition: 'good',
    status: 'sold',
    category: 'Sneakers',
    createdAt: '2024-01-20T00:00:00Z',
  },
];

type TestUser = { id: string; username: string; email: string; role: 'buyer' | 'seller' | 'admin' | 'visitor' };

const testUser: TestUser = { id: 'user-1', username: 'testuser', email: 'test@example.com', role: 'seller' };

const createStore = (user?: TestUser) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: user
      ? {
          auth: {
            user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null,
            mfaRequired: false,
            mfaToken: null,
          },
        }
      : undefined,
  });

const renderPage = (store = createStore(testUser)) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <MyListingsPage />
      </MemoryRouter>
    </Provider>,
  );

describe('MyListingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
        apiClient.get.mockResolvedValue({ data: { data: [] } });
    const { container } = renderPage();
    expect(container).toBeTruthy();
  });

  it('shows page title', () => {
        apiClient.get.mockResolvedValue({ data: { data: [] } });
    renderPage();
    const body = document.body.textContent ?? '';
    expect(body).toContain('Mes annonces');
  });

  it('shows "Publier une annonce" button', async () => {
        apiClient.get.mockResolvedValue({ data: { data: [] } });

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Publier une annonce');
    });
  });

  it('displays listings when loaded', async () => {
        apiClient.get.mockResolvedValue({ data: { data: mockListings } });

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Jordan 1 Retro High OG');
      expect(body).toContain('Nike Air Force 1');
    });
  });

  it('shows listing count', async () => {
        apiClient.get.mockResolvedValue({ data: { data: mockListings } });

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('2 annonces');
    });
  });

  it('displays status badge for each listing', async () => {
        apiClient.get.mockResolvedValue({ data: { data: mockListings } });

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Actif');
      expect(body).toContain('Vendu');
    });
  });

  it('shows condition labels', async () => {
        apiClient.get.mockResolvedValue({ data: { data: mockListings } });

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Comme neuf');
      expect(body).toContain('Bon état');
    });
  });

  it('shows empty state when no listings', async () => {
        apiClient.get.mockResolvedValue({ data: { data: [] } });

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain("Vous n'avez pas encore d'annonces");
    });
  });

  it('calls the correct API endpoint', async () => {
        apiClient.get.mockResolvedValue({ data: { data: [] } });

    renderPage();

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/users/profile/testuser/listings');
    });
  });

  it('handles API error gracefully', async () => {
        apiClient.get.mockRejectedValue(new Error('Network error'));

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Mes annonces');
    });
  });
});
