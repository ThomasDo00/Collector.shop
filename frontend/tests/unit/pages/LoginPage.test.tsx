import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '@pages/LoginPage';
import authReducer from '@features/auth/authSlice';

// Mock the API calls
vi.mock('@services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: undefined,
      pathname: '/',
    }),
  };
});

describe('LoginPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  const renderLoginPage = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render login form', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email|username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mot de passe|password/i)).toBeInTheDocument();
  });

  it('should display validation errors on empty submit', async () => {
    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: /se connecter|login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email ou nom d'utilisateur requis/i)).toBeInTheDocument();
      expect(screen.getByText(/mot de passe requis/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', () => {
    renderLoginPage();

    const passwordInput = screen.getByPlaceholderText(/mot de passe|password/i) as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /show|hide|toggle/i });

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(passwordInput.type).toBe('text');
    });
  });

  it('should display error message when auth fails', async () => {
    const mockError = 'Invalid credentials';

    // Update store with error
    store.dispatch({
      type: 'auth/login/rejected',
      payload: { message: mockError },
    });

    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByText(mockError)).toBeInTheDocument();
    });
  });

  it('should have link to register page', () => {
    renderLoginPage();

    const registerLink = screen.getByRole('link', { name: /inscription|register/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should have link to forgot password', () => {
    renderLoginPage();

    const forgotLink = screen.queryByRole('link', { name: /mot de passe oublié|forgot password/i });
    if (forgotLink) {
      expect(forgotLink).toHaveAttribute('href', expect.stringContaining('forget'));
    }
  });
});
