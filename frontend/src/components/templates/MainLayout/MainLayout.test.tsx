import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MainLayout from './MainLayout';
import authReducer from '@/features/auth/authSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
};

const renderWithProviders = () => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<div>Page Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

describe('MainLayout', () => {
  it('renders header, content, and footer', () => {
    renderWithProviders();

    expect(screen.getByText(/Collector.*shop/)).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
    expect(screen.getByText(/© 2026 Collector.shop/)).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = renderWithProviders();

    const layout = container.querySelector('.min-h-screen.flex.flex-col');
    expect(layout).toBeInTheDocument();
  });

  it('renders navigation links in header', () => {
    renderWithProviders();

    expect(screen.getByText('Catalogue')).toBeInTheDocument();
    expect(screen.getByText('Vendre')).toBeInTheDocument();
  });

  it('renders footer links', () => {
    renderWithProviders();

    expect(screen.getAllByText('A propos').length).toBeGreaterThan(0);
    expect(screen.getByText('Aide')).toBeInTheDocument();
  });
});
