import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  verifyMfaLogin,
  cancelMfa,
  selectMfaRequired,
} from '../authSlice';
import type { RootState } from '@/store';

// Mock authService
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    verifyMfaLogin: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    hasAuth: vi.fn(),
    clearAuth: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const createTestStore = () =>
  configureStore({ reducer: { auth: authReducer } });

describe('authSlice – MFA coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  // ── login.fulfilled – MFA path ─────────────────────────────────────────────

  it('login.fulfilled with mfaRequired sets mfaRequired=true and stores mfaToken', () => {
    const store = createTestStore();
    store.dispatch({
      type: login.fulfilled.type,
      payload: { mfaRequired: true, mfaToken: 'tok-abc' },
    });
    const state = store.getState().auth;
    expect(state.mfaRequired).toBe(true);
    expect(state.mfaToken).toBe('tok-abc');
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('login.fulfilled with mfaRequired:true and no token uses null', () => {
    const store = createTestStore();
    store.dispatch({
      type: login.fulfilled.type,
      payload: { mfaRequired: true },
    });
    const state = store.getState().auth;
    expect(state.mfaToken).toBeNull();
  });

  // ── verifyMfaLogin thunk ───────────────────────────────────────────────────

  it('verifyMfaLogin.pending sets isLoading=true and clears error', () => {
    const store = createTestStore();
    // Set an existing error first
    store.dispatch({
      type: login.rejected.type,
      payload: { code: 'INVALID_CREDENTIALS', message: 'Bad' },
    });
    store.dispatch({ type: verifyMfaLogin.pending.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('verifyMfaLogin.fulfilled authenticates user and clears MFA state', () => {
    const store = createTestStore();
    const user = { id: '1', email: 'u@test.com', username: 'u', role: 'buyer' as const };
    // Simulate MFA state
    store.dispatch({
      type: login.fulfilled.type,
      payload: { mfaRequired: true, mfaToken: 'tok-abc' },
    });
    store.dispatch({ type: verifyMfaLogin.fulfilled.type, payload: user });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.mfaRequired).toBe(false);
    expect(state.mfaToken).toBeNull();
    expect(localStorageMock.getItem('user')).toBe(JSON.stringify(user));
  });

  it('verifyMfaLogin.rejected sets error', () => {
    const store = createTestStore();
    const error = { code: 'INVALID_CREDENTIALS', message: 'Wrong code' };
    store.dispatch({ type: verifyMfaLogin.rejected.type, payload: error });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.error).toEqual(error);
  });

  it('verifyMfaLogin.rejected without payload sets error to null', () => {
    const store = createTestStore();
    store.dispatch({ type: verifyMfaLogin.rejected.type });
    expect(store.getState().auth.error).toBeNull();
  });

  // ── cancelMfa reducer ─────────────────────────────────────────────────────

  it('cancelMfa clears mfaRequired, mfaToken and error', () => {
    const store = createTestStore();
    // Put the store in MFA state with an error
    store.dispatch({
      type: login.fulfilled.type,
      payload: { mfaRequired: true, mfaToken: 'tok' },
    });
    store.dispatch({
      type: verifyMfaLogin.rejected.type,
      payload: { code: 'BAD', message: 'bad code' },
    });

    store.dispatch(cancelMfa());

    const state = store.getState().auth;
    expect(state.mfaRequired).toBe(false);
    expect(state.mfaToken).toBeNull();
    expect(state.error).toBeNull();
  });

  // ── selectMfaRequired selector ─────────────────────────────────────────────

  it('selectMfaRequired returns mfaRequired from state', () => {
    const state = {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        error: null,
        mfaRequired: true,
        mfaToken: 'tok',
      },
    } as RootState;
    expect(selectMfaRequired(state)).toBe(true);
  });

  it('selectMfaRequired returns false by default', () => {
    const store = createTestStore();
    expect(selectMfaRequired(store.getState() as RootState)).toBe(false);
  });
});
