import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';

vi.mock('@/services/cart.service', () => ({
  cartService: {
    getCart: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
}));

vi.mock('@/core/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import CartPage from './CartPage';

const mockCart = {
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      title: 'Jordan 1 Retro High',
      price: 180,
      imageUrl: 'https://example.com/jordan.jpg',
      seller: { username: 'john' },
      quantity: 1,
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      title: 'Nike Air Max 90',
      price: 120,
      imageUrl: 'https://example.com/airmax.jpg',
      seller: { username: 'jane' },
      quantity: 1,
    },
  ],
  subtotal: 300,
  commission: 15,
  shipping: 8.9,
  total: 323.9,
};

type TestUser = { id: string; username: string; email: string; role: 'buyer' | 'seller' | 'admin' | 'visitor' };

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
      : {
          auth: {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: null,
            mfaRequired: false,
            mfaToken: null,
          },
        },
  });

const testUser: TestUser = { id: 'user-1', username: 'testuser', email: 'test@example.com', role: 'buyer' };

const renderPage = (store = createStore(testUser)) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    </Provider>,
  );

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { cartService } = require('@/services/cart.service');
    cartService.getCart.mockResolvedValue(mockCart);
    const { container } = renderPage();
    expect(container).toBeTruthy();
  });

  it('shows empty state when not authenticated', async () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Votre panier est vide');
    });
  });

  it('shows login button when not authenticated', async () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Se connecter');
    });
  });

  it('displays cart items when loaded', async () => {
    const { cartService } = require('@/services/cart.service');
    cartService.getCart.mockResolvedValue(mockCart);

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Jordan 1 Retro High');
      expect(body).toContain('Nike Air Max 90');
    });
  });

  it('shows cart totals', async () => {
    const { cartService } = require('@/services/cart.service');
    cartService.getCart.mockResolvedValue(mockCart);

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Récapitulatif');
      expect(body).toContain('Sous-total');
      expect(body).toContain('Commission');
    });
  });

  it('shows checkout CTA', async () => {
    const { cartService } = require('@/services/cart.service');
    cartService.getCart.mockResolvedValue(mockCart);

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Passer à la commande');
    });
  });

  it('shows empty cart state when cart has no items', async () => {
    const { cartService } = require('@/services/cart.service');
    cartService.getCart.mockResolvedValue({ items: [], subtotal: 0, commission: 0, shipping: 0, total: 0 });

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Votre panier est vide');
    });
  });

  it('calls removeItem when remove button is clicked', async () => {
    const { cartService } = require('@/services/cart.service');
    cartService.getCart.mockResolvedValue(mockCart);
    cartService.removeItem.mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Jordan 1 Retro High');
    });

    const removeButtons = Array.from(document.querySelectorAll('button[aria-label="Retirer du panier"]'));
    expect(removeButtons.length).toBeGreaterThan(0);
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(cartService.removeItem).toHaveBeenCalledWith('user-1', 'item-1');
    });
  });

  it('calls clearCart when vider button is clicked', async () => {
    const { cartService } = require('@/services/cart.service');
    cartService.getCart.mockResolvedValue(mockCart);
    cartService.clearCart.mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      const body = document.body.textContent ?? '';
      expect(body).toContain('Vider le panier');
    });

    const clearButton = Array.from(document.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Vider le panier'),
    );
    expect(clearButton).toBeTruthy();
    fireEvent.click(clearButton!);

    await waitFor(() => {
      expect(cartService.clearCart).toHaveBeenCalledWith('user-1');
    });
  });
});
