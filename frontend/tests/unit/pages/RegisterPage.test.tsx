import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '@/pages/RegisterPage';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';

describe('RegisterPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should render register page', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </Provider>
    );

    expect(document.body).toBeTruthy();
  });

  it('should display registration form', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </Provider>
    );

    expect(container.firstChild).toBeTruthy();
  });
});
