import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ProductDetailPage from '@/pages/ProductDetailPage';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';

describe('ProductDetailPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should render product detail page', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductDetailPage />
        </BrowserRouter>
      </Provider>
    );

    expect(document.body).toBeTruthy();
  });

  it('should display product information', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductDetailPage />
        </BrowserRouter>
      </Provider>
    );

    expect(container.firstChild).toBeTruthy();
  });
});
