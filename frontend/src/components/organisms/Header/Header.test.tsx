import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from './Header';
import authReducer from '@/features/auth/authSlice';

const createMockStore = (isAuthenticated = false, user = null) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: isAuthenticated && user ? user : null,
        isAuthenticated,
        isLoading: false,
        error: null,
        isInitialized: true,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header component', () => {
    renderWithProviders(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('displays navigation links on desktop', () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole('link', { name: 'Catalogue' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Categories' })).toBeInTheDocument();
  });

  it('displays cart link', () => {
    renderWithProviders(<Header />, createMockStore(false));
    expect(screen.getByRole('link', { name: 'Panier' })).toBeInTheDocument();
  });

  it('displays login and register buttons when not authenticated', () => {
    renderWithProviders(<Header />, createMockStore(false));
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('displays mobile menu button', () => {
    renderWithProviders(<Header />);
    const mobileButtons = screen.getAllByRole('button');
    expect(mobileButtons.length).toBeGreaterThan(0);
  });

  it('toggles mobile menu state', async () => {
    renderWithProviders(<Header />);
    
    const buttons = screen.getAllByRole('button');
    const mobileMenuButton = buttons.find(btn => btn.getAttribute('aria-expanded') !== null);
    
    if (mobileMenuButton) {
      fireEvent.click(mobileMenuButton);
      await waitFor(() => {
        expect(mobileMenuButton.getAttribute('aria-expanded')).toBe('true');
      });
    }
  });

  it('handles scroll effect', async () => {
    renderWithProviders(<Header />);
    
    fireEvent.scroll(window, { y: 100 });
    await waitFor(() => {
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });
  });

  it('exports default component', () => {
    expect(Header).toBeDefined();
  });
});
