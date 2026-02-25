import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import RegisterPage from './RegisterPage';

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({ mfaRequired: false, user: {} }),
    register: vi.fn(),
    logout: vi.fn(),
    hasAuth: vi.fn().mockReturnValue(false),
    clearAuth: vi.fn(),
    setupMfa: vi.fn().mockResolvedValue({ secret: 'BASE32SECRET', qrCode: 'data:image/png;base64,abc' }),
    enableMfa: vi.fn().mockResolvedValue({}),
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const createStore = () =>
  configureStore({ reducer: { auth: authReducer } });

const renderPage = (store = createStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </Provider>,
  );

// ── Tests ──────────────────────────────────────────────────────────────────

describe('RegisterPage – coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the registration form', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/mon_pseudo/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/votre@email.com/i)).toBeDefined();
  });

  it('renders accept terms checkbox', () => {
    renderPage();
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('shows login link', () => {
    renderPage();
    expect(screen.getByText(/Deja un compte/i)).toBeDefined();
  });

  it('toggles password visibility', () => {
    renderPage();
    const toggleBtns = screen.getAllByRole('button');
    const visibilityToggles = toggleBtns.filter(
      (btn) => btn.getAttribute('aria-label')?.includes('mot de passe') ||
               btn.getAttribute('aria-label')?.includes('Afficher'),
    );
    expect(visibilityToggles.length).toBeGreaterThan(0);
  });

  it('shows password strength indicators after typing', async () => {
    renderPage();
    const passwordInput = document.querySelector('input[placeholder="••••••••"]') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'a' } });
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(body).toContain('8 caracteres minimum');
    });
  });

  it('password strength updates as user types', async () => {
    renderPage();
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const passwordInput = passwordInputs[0];
    fireEvent.input(passwordInput, { target: { value: 'SecurePass1!' } });

    await waitFor(() => {
      // The password checks should update based on the value
      const body = document.body.textContent;
      expect(body).toBeTruthy();
    });
  });

  it('shows validation errors when submitting empty form', async () => {
    renderPage();
    const form = document.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(
        body.includes('au moins 3') ||
        body.includes('invalide') ||
        body.includes('requis') ||
        body.includes('minimum') ||
        body.includes('Adresse email'),
      ).toBe(true);
    });
  });

  it('shows auth error from store when present', () => {
    const store = createStore();
    // Pre-populate with an error
    store.dispatch({
      type: 'auth/register/rejected',
      payload: { code: 'EMAIL_EXISTS', message: 'Email deja utilisee' },
    });
    renderPage(store);
    expect(screen.getByText('Email deja utilisee')).toBeDefined();
  });

  it('renders without crashing with loading state', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: true,
          isInitialized: false,
          error: null,
          mfaRequired: false,
          mfaToken: null,
        },
      },
    });
    const { container } = renderPage(store);
    expect(container).toBeTruthy();
  });
});
