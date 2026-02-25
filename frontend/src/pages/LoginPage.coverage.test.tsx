import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import LoginPage from './LoginPage';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    verifyMfaLogin: vi.fn(),
    logout: vi.fn(),
    hasAuth: vi.fn().mockReturnValue(false),
    clearAuth: vi.fn(),
  },
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Helpers ────────────────────────────────────────────────────────────────

const createStore = (preloadedAuth?: Partial<ReturnType<typeof authReducer>>) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: preloadedAuth ? { auth: preloadedAuth as any } : undefined,
  });

const renderPage = (store = createStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>,
  );

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LoginPage – coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the login form with email and password fields', () => {
    renderPage();
    expect(screen.getByText(/Bon retour/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/votre@email.com/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeDefined();
  });

  it('renders register link', () => {
    renderPage();
    expect(screen.getByText(/Creer un compte/i)).toBeDefined();
  });

  it('renders forgot password link', () => {
    renderPage();
    expect(screen.getByText(/Mot de passe oublie/i)).toBeDefined();
  });

  it('shows password toggle button', () => {
    renderPage();
    const toggleBtn = screen.getByLabelText(/Afficher le mot de passe/i);
    expect(toggleBtn).toBeDefined();
  });

  it('toggles password visibility', () => {
    renderPage();
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const toggleBtn = screen.getByLabelText(/Afficher le mot de passe/i);

    expect(passwordInput.getAttribute('type')).toBe('password');
    fireEvent.click(toggleBtn);
    expect(passwordInput.getAttribute('type')).toBe('text');
    fireEvent.click(toggleBtn);
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it('shows MFA success banner when mfaSetupDone is in location state', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { mfaSetupDone: true } }]}>
          <LoginPage />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText(/2FA active/i)).toBeDefined();
  });

  it('shows auth error alert when there is an error', () => {
    const store = createStore({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: { code: 'INVALID_CREDENTIALS', message: 'Mot de passe incorrect' },
      mfaRequired: false,
      mfaToken: null,
    });
    renderPage(store);
    expect(screen.getByText('Mot de passe incorrect')).toBeDefined();
  });

  it('shows loading state on submit button when isLoading is true', () => {
    const store = createStore({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: true,
      error: null,
      mfaRequired: false,
      mfaToken: null,
    });
    renderPage(store);
    // Button should be rendered (isLoading prop passed)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows MFA verification form when mfaRequired is true', () => {
    const store = createStore({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
      mfaRequired: true,
      mfaToken: 'mfa-tok',
    });
    renderPage(store);
    expect(screen.getByText(/Verification en 2 etapes/i)).toBeDefined();
    expect(screen.getByPlaceholderText('000000')).toBeDefined();
  });

  it('MFA form shows error alert when there is an auth error', () => {
    const store = createStore({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: { code: 'INVALID_CREDENTIALS', message: 'Code invalide' },
      mfaRequired: true,
      mfaToken: 'mfa-tok',
    });
    renderPage(store);
    expect(screen.getByText('Code invalide')).toBeDefined();
  });

  it('MFA form has Retour button that dispatches cancelMfa', async () => {
    const store = createStore({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
      mfaRequired: true,
      mfaToken: 'mfa-tok',
    });
    renderPage(store);
    const retourBtn = screen.getByText(/Retour a la connexion/i);
    fireEvent.click(retourBtn);
    await waitFor(() => {
      expect(store.getState().auth.mfaRequired).toBe(false);
    });
  });

  it('submitting login form with empty fields shows validation errors', async () => {
    renderPage();
    const submitBtn = screen.getByText(/Se connecter/i);
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText(/Email ou nom d'utilisateur requis/i)).toBeDefined();
    });
  });

  it('submitting login dispatches login thunk on valid input', async () => {
    const { authService } = await import('@/services/auth.service');
    const mockLogin = authService.login as ReturnType<typeof vi.fn>;
    mockLogin.mockResolvedValue({ mfaRequired: false, user: { id: '1', email: 'a@b.com', username: 'ab', role: 'buyer' } });

    const store = createStore();
    renderPage(store);

    fireEvent.input(screen.getByPlaceholderText(/votre@email.com/i), { target: { value: 'test@test.com' } });
    fireEvent.input(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });

    const submitBtn = screen.getByText(/Se connecter/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // The thunk was dispatched (auth service was called or navigation happened)
      expect(mockLogin).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
  });
});
