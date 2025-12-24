import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import { handleApiError, type AppError } from '@/services/api/errorHandler';
import type { LoginRequest, RegisterRequest, UserRole } from '@/types';
import type { RootState } from '@/store';

/**
 * Auth user state
 */
interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

/**
 * Auth state
 */
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: AppError | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

/**
 * Login async thunk
 */
export const login = createAsyncThunk<
  AuthUser,
  LoginRequest,
  { rejectValue: AppError }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response.user;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

/**
 * Register async thunk
 */
export const register = createAsyncThunk<
  { email: string; username: string },
  RegisterRequest,
  { rejectValue: AppError }
>('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.register(data);
    return { email: response.email, username: response.username };
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

/**
 * Logout async thunk
 */
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

/**
 * Initialize auth from stored tokens
 */
export const initializeAuth = createAsyncThunk<
  AuthUser | null,
  void,
  { rejectValue: AppError }
>('auth/initialize', async (_, { rejectWithValue }) => {
  try {
    if (!authService.hasAuth()) {
      return null;
    }

    // In a real app, we'd verify the token with the backend
    // For now, we'll just check if we have stored auth
    // The actual user data should come from a /me endpoint
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser) as AuthUser;
    }

    return null;
  } catch (error) {
    authService.clearAuth();
    return rejectWithValue(handleApiError(error));
  }
});

/**
 * Auth slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Clear any auth errors
     */
    clearError(state) {
      state.error = null;
    },

    /**
     * Update user data
     */
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    /**
     * Set loading state
     */
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || null;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        // User needs to verify email before being authenticated
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || null;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        localStorage.removeItem('user');
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('user');
      });

    // Initialize
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

// Export actions
export const { clearError, updateUser, setLoading } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthInitialized = (state: RootState) => state.auth.isInitialized;
export const selectUserRole = (state: RootState) => state.auth.user?.role;

export default authSlice.reducer;
