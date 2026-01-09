import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
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

  it('should render login page without crashing', () => {
    const { container } = renderLoginPage();
    expect(container).toBeTruthy();
  });

  it('should render form elements', () => {
    const { container } = renderLoginPage();
    expect(container.querySelector('form') || container.querySelector('input')).toBeTruthy();
  });
});
