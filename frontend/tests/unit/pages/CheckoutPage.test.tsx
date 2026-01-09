import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import CheckoutPage from '@pages/CheckoutPage';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';

describe('CheckoutPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should render without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </Provider>
    );
    expect(container).toBeTruthy();
  });

  it('should render a main element', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </Provider>
    );
    expect(container.firstChild).toBeTruthy();
  });
});
