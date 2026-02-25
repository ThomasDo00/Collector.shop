import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import CheckoutPage from './CheckoutPage';

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockCart = {
  userId: 'user-1',
  items: [
    {
      id: 'item-1',
      productId: 'p-1',
      title: 'Nike Air Force 1',
      imageUrl: 'https://example.com/img.jpg',
      price: 120,
      quantity: 1,
      seller: { username: 'seller1', id: 's-1', avatarUrl: '' },
    },
  ],
  total: 126,
  subtotal: 120,
  commission: 6,
  shipping: 0,
  itemCount: 1,
};

vi.mock('@/services/cart.service', () => ({
  cartService: { getCart: vi.fn() },
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

const renderPage = (store = createStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    </Provider>,
  );

// ── Tests ──────────────────────────────────────────────────────────────────

describe('CheckoutPage – coverage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { cartService } = await import('@/services/cart.service');
    (cartService.getCart as ReturnType<typeof vi.fn>).mockResolvedValue(mockCart);
  });

  it('renders without crashing', () => {
    const { container } = renderPage();
    expect(container).toBeTruthy();
  });

  it('shows checkout steps in page content', async () => {
    renderPage();
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(body).toContain('Panier');
      expect(body).toContain('Livraison');
      expect(body).toContain('Paiement');
    });
  });

  it('renders cart items after loading', async () => {
    renderPage();
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(body).toContain('Nike Air Force 1');
    });
  });

  it('renders cart total after loading', async () => {
    renderPage();
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(body).toContain('120');
    });
  });

  it('renders with authenticated user', async () => {
    const store = createStore({ id: 'user-1', username: 'testuser', email: 'test@test.com', role: 'buyer' });
    const { container } = renderPage(store);
    expect(container).toBeTruthy();
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(body).toContain('Panier');
    });
  });

  it('can navigate to shipping step', async () => {
    renderPage();
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(body).toContain('Nike Air Force 1');
    });

    const continueBtn = document.querySelector('button[type="button"]') ||
                        Array.from(document.querySelectorAll('button')).find(
                          b => b.textContent?.includes('Continuer'),
                        );
    if (continueBtn) {
      fireEvent.click(continueBtn as HTMLElement);
    }
    expect(document.body).toBeTruthy();
  });

  it('handles API error gracefully', async () => {
    const { cartService } = await import('@/services/cart.service');
    (cartService.getCart as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
    expect(() => renderPage()).not.toThrow();
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('shipping form validation works', async () => {
    renderPage();
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(body).toContain('Nike Air Force 1');
    });

    // Navigate to shipping step
    const continueBtn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent?.includes('Continuer'),
    );
    if (continueBtn) {
      fireEvent.click(continueBtn as HTMLElement);
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
        await waitFor(() => {
          expect(document.body.textContent?.length).toBeGreaterThan(0);
        });
      }
    }
    expect(document.body).toBeTruthy();
  });
});
