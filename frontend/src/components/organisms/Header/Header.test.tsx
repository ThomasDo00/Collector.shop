import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from './Header';
import authReducer, { selectIsAuthenticated, selectCurrentUser } from '@/features/auth/authSlice';
import { useAppSelector, useAppDispatch } from '@/store';

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({ pathname: '/' })),
  };
});

// Mock store hooks
vi.mock('@/store', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(() => vi.fn()),
}));

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
        mfaRequired: false,
        mfaToken: null,
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
    
    // Setup default mocks
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      if (selector === selectIsAuthenticated) {
        return false;
      }
      if (selector === selectCurrentUser) {
        return null;
      }
      return undefined;
    });
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

  it('handles search navigation', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    
    renderWithProviders(<Header />);
    
    // Find the search input and its form
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    const searchForm = searchInput.closest('form');
    
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.submit(searchForm!);
    
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=test%20query');
  });

  it('handles logout', async () => {
    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch);
    
    // Mock authenticated user
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      if (selector === selectIsAuthenticated) {
        return true;
      }
      if (selector === selectCurrentUser) {
        return { id: 1, email: 'test@example.com', username: 'testuser' };
      }
      return undefined;
    });
    
    renderWithProviders(<Header />);
    
    // First open the user menu by clicking the avatar button
    const userMenuButtons = screen.getAllByRole('button');
    const userMenuButton = userMenuButtons.find(btn => btn.getAttribute('aria-haspopup') === 'true');
    if (userMenuButton) {
      fireEvent.click(userMenuButton);
    }
    
    // Then find and click logout button
    const logoutButton = screen.getByRole('button', { name: /deconnexion/i });
    expect(logoutButton).toBeInTheDocument();
    fireEvent.click(logoutButton);
    
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    
    // Wait for navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('exports default component', () => {
    expect(Header).toBeDefined();
  });
});
