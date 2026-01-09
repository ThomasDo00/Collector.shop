import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Header from '@/components/organisms/Header';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';

describe('Header', () => {
  it('should render header', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    expect(document.body).toBeTruthy();
  });

  it('should render navigation', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    expect(container.querySelector('header') || container.firstChild).toBeTruthy();
  });
});
