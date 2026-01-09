import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';

describe('HomePage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should render home page', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );

    expect(document.body).toBeTruthy();
  });

  it('should display home page content', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );

    expect(container.firstChild).toBeTruthy();
  });
});
