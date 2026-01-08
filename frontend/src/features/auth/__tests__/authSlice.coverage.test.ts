import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  register,
  logout,
  initializeAuth,
  clearError,
  updateUser,
  setLoading,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthInitialized,
  selectUserRole,
} from '../authSlice';
import type { RootState } from '@/store';

// Mock authService
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
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
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('authSlice - Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  const createTestStore = () => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  };

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const store = createTestStore();
      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Reducers', () => {
    it('clearError clears the error', () => {
      // Set an error first
      const stateWithError = authReducer(
        { user: null, isAuthenticated: false, isLoading: false, isInitialized: false, error: { code: 'TEST_ERROR', message: 'Test' } },
        { type: 'dummy' }
      );

      const nextState = authReducer(stateWithError, clearError());
      expect(nextState.error).toBeNull();
    });

    it('updateUser updates user data when user exists', () => {
      const initialUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'buyer' as const,
      };

      const stateWithUser = {
        user: initialUser,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

      const nextState = authReducer(stateWithUser, updateUser({ username: 'newusername' }));

      expect(nextState.user?.username).toBe('newusername');
      expect(nextState.user?.email).toBe('test@example.com');
    });

    it('updateUser does nothing when user is null', () => {
      const stateWithoutUser = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        error: null,
      };

      const nextState = authReducer(stateWithoutUser, updateUser({ username: 'newusername' }));
      expect(nextState.user).toBeNull();
    });

    it('setLoading updates loading state', () => {
      const store = createTestStore();
      store.dispatch(setLoading(true));

      expect(store.getState().auth.isLoading).toBe(true);

      store.dispatch(setLoading(false));
      expect(store.getState().auth.isLoading).toBe(false);
    });
  });

  describe('Login Thunk', () => {
    it('handles login.pending', () => {
      const store = createTestStore();
      store.dispatch({ type: login.pending.type });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles login.fulfilled', () => {
      const store = createTestStore();
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user' as const,
      };

      store.dispatch({ type: login.fulfilled.type, payload: user });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(user);
    });

    it('handles login.rejected', () => {
      const store = createTestStore();
      const error = { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' };

      store.dispatch({ type: login.rejected.type, payload: error });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toEqual(error);
    });

    it('handles login.rejected without payload', () => {
      const store = createTestStore();
      store.dispatch({ type: login.rejected.type });

      const state = store.getState().auth;
      expect(state.error).toBeNull();
    });
  });

  describe('Register Thunk', () => {
    it('handles register.pending', () => {
      const store = createTestStore();
      store.dispatch({ type: register.pending.type });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles register.fulfilled', () => {
      const store = createTestStore();
      store.dispatch({ type: register.fulfilled.type });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
    });

    it('handles register.rejected', () => {
      const store = createTestStore();
      const error = { code: 'EMAIL_EXISTS', message: 'Email already exists' };

      store.dispatch({ type: register.rejected.type, payload: error });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toEqual(error);
    });

    it('handles register.rejected without payload', () => {
      const store = createTestStore();
      store.dispatch({ type: register.rejected.type });

      const state = store.getState().auth;
      expect(state.error).toBeNull();
    });
  });

  describe('Logout Thunk', () => {
    it('handles logout.pending', () => {
      const store = createTestStore();
      store.dispatch({ type: logout.pending.type });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
    });

    it('handles logout.fulfilled', () => {
      const store = createTestStore();

      // Set initial authenticated state
      const user = { id: '1', email: 'test@example.com', username: 'testuser', role: 'user' as const };
      localStorageMock.setItem('user', JSON.stringify(user));

      store.dispatch({ type: logout.fulfilled.type });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBeNull();
      expect(localStorageMock.getItem('user')).toBeNull();
    });

    it('handles logout.rejected', () => {
      const store = createTestStore();
      localStorageMock.setItem('user', JSON.stringify({ id: '1' }));

      store.dispatch({ type: logout.rejected.type });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(localStorageMock.getItem('user')).toBeNull();
    });
  });

  describe('InitializeAuth Thunk', () => {
    it('handles initializeAuth.pending', () => {
      const store = createTestStore();
      store.dispatch({ type: initializeAuth.pending.type });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
    });

    it('handles initializeAuth.fulfilled with user', () => {
      const store = createTestStore();
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user' as const,
      };

      store.dispatch({ type: initializeAuth.fulfilled.type, payload: user });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(user);
    });

    it('handles initializeAuth.fulfilled without user', () => {
      const store = createTestStore();
      store.dispatch({ type: initializeAuth.fulfilled.type, payload: null });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('handles initializeAuth.rejected', () => {
      const store = createTestStore();
      store.dispatch({ type: initializeAuth.rejected.type });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('Selectors', () => {
    it('selectCurrentUser returns user', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'buyer' as const,
      };

      const state = {
        auth: {
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        },
      } as RootState;

      expect(selectCurrentUser(state)).toEqual(user);
    });

    it('selectIsAuthenticated returns authentication status', () => {
      const state = {
        auth: {
          user: null,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: false,
          error: null,
        },
      } as RootState;

      expect(selectIsAuthenticated(state)).toBe(true);
    });

    it('selectAuthLoading returns loading status', () => {
      const state = {
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: true,
          isInitialized: false,
          error: null,
        },
      } as RootState;

      expect(selectAuthLoading(state)).toBe(true);
    });

    it('selectAuthError returns error', () => {
      const error = { code: 'TEST_ERROR', message: 'Test error' };
      const state = {
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error,
        },
      } as RootState;

      expect(selectAuthError(state)).toEqual(error);
    });

    it('selectAuthInitialized returns initialized status', () => {
      const state = {
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        },
      } as RootState;

      expect(selectAuthInitialized(state)).toBe(true);
    });

    it('selectUserRole returns user role', () => {
      const state = {
        auth: {
          user: { id: '1', email: 'test@example.com', username: 'testuser', role: 'admin' as const },
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        },
      } as RootState;

      expect(selectUserRole(state)).toBe('admin');
    });

    it('selectUserRole returns undefined when no user', () => {
      const state = {
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
        },
      } as RootState;

      expect(selectUserRole(state)).toBeUndefined();
    });
  });
});
