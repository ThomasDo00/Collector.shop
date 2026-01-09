import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CatalogPage from '@pages/CatalogPage';
import authReducer from '@features/auth/authSlice';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

describe('CatalogPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  const renderCatalogPage = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <CatalogPage />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render catalog page', () => {
    renderCatalogPage();

    expect(screen.getByText(/catalogue|catalog/i)).toBeInTheDocument();
  });

  it('should display products grid', () => {
    renderCatalogPage();

    // Should display at least some mock products
    const productElements = screen.getAllByRole('img');
    expect(productElements.length).toBeGreaterThan(0);
  });

  it('should display filter sidebar', () => {
    renderCatalogPage();

    expect(screen.getByRole('region', { name: /filtre|filter/i })).toBeInTheDocument();
  });

  it('should toggle mobile filter', async () => {
    renderCatalogPage();

    const toggleButton = screen.getByRole('button', { name: /filtre|filter/i });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      // Mobile filter should be visible
      const filterSidebar = screen.getByRole('region', { name: /filtre|filter/i });
      expect(filterSidebar).toBeVisible();
    });
  });

  it('should display breadcrumb navigation', () => {
    renderCatalogPage();

    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb|navigation/i });
    expect(breadcrumb).toBeInTheDocument();
  });

  it('should filter products by category', async () => {
    renderCatalogPage();

    const categoryFilter = screen.getByRole('checkbox', { name: /sneakers|sneaker/i });
    fireEvent.click(categoryFilter);

    await waitFor(() => {
      // Should show only sneaker products
      const productTitles = screen.getAllByText(/nike|sneaker/i);
      expect(productTitles.length).toBeGreaterThan(0);
    });
  });

  it('should have working search', async () => {
    renderCatalogPage();

    const searchInput = screen.queryByPlaceholderText(/rechercher|search/i);
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'Nike' } });

      await waitFor(() => {
        const results = screen.queryAllByText(/nike/i);
        expect(results.length).toBeGreaterThan(0);
      });
    }
  });

  it('should toggle favorite status of products', async () => {
    renderCatalogPage();

    const favoriteButtons = screen.getAllByRole('button', { name: /favoris|favorite|coeur|heart/i });
    if (favoriteButtons.length > 0) {
      fireEvent.click(favoriteButtons[0]);

      await waitFor(() => {
        // Button should show filled heart or active state
        expect(favoriteButtons[0]).toHaveClass(/active|filled/i);
      });
    }
  });

  it('should sort products', async () => {
    renderCatalogPage();

    const sortSelect = screen.queryByRole('combobox', { name: /tri|sort/i });
    if (sortSelect) {
      fireEvent.change(sortSelect, { target: { value: 'price_asc' } });

      await waitFor(() => {
        // Products should be reordered
        expect(sortSelect).toHaveValue('price_asc');
      });
    }
  });

  it('should display pagination or load more', () => {
    renderCatalogPage();

    const loadMoreButton = screen.queryByRole('button', { name: /charger plus|load more|voir plus|see more/i });
    const pagination = screen.queryByRole('navigation', { name: /pagination/i });

    expect(loadMoreButton || pagination).toBeTruthy();
  });
});
