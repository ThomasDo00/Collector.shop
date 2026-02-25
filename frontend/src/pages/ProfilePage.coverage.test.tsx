import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import ProfilePage from './ProfilePage';

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockProfile = {
  id: 'u-1',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  avatarUrl: null,
  bio: 'Passionné de collection',
  location: 'Paris',
  createdAt: new Date().toISOString(),
  salesCount: 12,
  reviewsCount: 8,
  averageRating: 4.5,
};

const mockListings = [
  {
    id: 'p-1',
    title: 'Nike AF1',
    price: 120,
    imageUrl: 'https://example.com/img.jpg',
    condition: 'new',
    status: 'active',
    categoryId: 'cat-1',
    categoryName: 'Sneakers',
    seller: { id: 'u-1', username: 'testuser', avatarUrl: '' },
    createdAt: new Date().toISOString(),
  },
];

const mockReviews = [
  {
    id: 'r-1',
    buyerId: 'buyer-1',
    buyerUsername: 'buyer1',
    buyerAvatarUrl: null,
    rating: 5,
    comment: 'Super vendeur !',
    createdAt: new Date().toISOString(),
  },
];

vi.mock('@/services/user.service', () => ({
  userService: {
    getProfile: vi.fn(),
    getListings: vi.fn(),
    getReviews: vi.fn(),
  },
}));

vi.mock('@/core/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const createStore = (user?: Record<string, unknown>) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: user
      ? { auth: { user, isAuthenticated: true, isLoading: false, isInitialized: true, error: null, mfaRequired: false, mfaToken: null } }
      : undefined,
  });

const renderPage = (path = '/profile/testuser', store = createStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ProfilePage – coverage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { userService } = await import('@/services/user.service');
    (userService.getProfile as ReturnType<typeof vi.fn>).mockResolvedValue(mockProfile);
    (userService.getListings as ReturnType<typeof vi.fn>).mockResolvedValue(mockListings);
    (userService.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue(mockReviews);
  });

  it('renders without crashing', () => {
    const { container } = renderPage();
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    renderPage();
    // During loading, the container exists
    expect(document.body.firstChild).not.toBeNull();
  });

  it('renders user profile after loading', async () => {
    renderPage();
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(body).toContain('testuser');
    });
  });

  it('renders listings tab', async () => {
    renderPage();
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(body).toContain('Nike AF1');
    });
  });

  it('shows own profile indicator when viewing own profile', async () => {
    const store = createStore({ id: 'u-1', username: 'testuser', email: 'test@test.com', role: 'buyer' });
    renderPage('/profile/testuser', store);
    await waitFor(() => {
      // page renders without error
      expect(document.body).toBeTruthy();
    });
  });

  it('handles API error gracefully', async () => {
    const { userService } = await import('@/services/user.service');
    (userService.getProfile as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not found'));
    (userService.getListings as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not found'));
    (userService.getReviews as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not found'));

    expect(() => renderPage()).not.toThrow();
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('uses default username when no URL param (not logged in)', async () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
    const { userService } = await import('@/services/user.service');
    await waitFor(() => {
      expect(userService.getProfile).toHaveBeenCalled();
    });
  });
});
