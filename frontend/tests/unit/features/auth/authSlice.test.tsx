import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  updateUser,
  clearError,
  setLoading,
} from '@features/auth/authSlice';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should initialize with default state', () => {
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should handle updateUser action', () => {
    const existingUser = {
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      role: 'buyer' as const,
    };

    // Create a store with an existing user so updateUser merges correctly
    const storeWithUser = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { ...store.getState().auth, user: existingUser } },
    });

    const updatePayload = { firstName: 'Test', lastName: 'User' };
    storeWithUser.dispatch(updateUser(updatePayload));
    const state = storeWithUser.getState().auth;
    expect(state.user).toMatchObject({ ...existingUser, ...updatePayload });
  });

  it('should handle clearError action', () => {
    store.dispatch(clearError());
    const state = store.getState().auth;
    expect(state.error).toBeNull();
  });

  it('should handle setLoading action', () => {
    store.dispatch(setLoading(true));
    let state = store.getState().auth;
    expect(state.isLoading).toBe(true);

    store.dispatch(setLoading(false));
    state = store.getState().auth;
    expect(state.isLoading).toBe(false);
  });

  it('should track authentication status', () => {
    const state = store.getState().auth;
    expect(typeof state.isAuthenticated === 'boolean').toBe(true);
  });

  it('should track loading state', () => {
    const state = store.getState().auth;
    expect(typeof state.isLoading === 'boolean').toBe(true);
  });

  it('should track error state', () => {
    const state = store.getState().auth;
    expect(state.error === null || typeof state.error === 'object').toBe(true);
  });
});
