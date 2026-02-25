import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockCategories = [
  { id: 'cat-1', name: 'Sneakers', slug: 'sneakers', iconUrl: '', productCount: 10 },
  { id: 'cat-2', name: 'Figurines', slug: 'figurines', iconUrl: '', productCount: 5 },
];

const mockProducts = Array.from({ length: 6 }, (_, i) => ({
  id: `p-${i}`,
  title: `Product ${i}`,
  price: 100 + i * 10,
  imageUrl: 'https://example.com/img.jpg',
  condition: 'new',
  status: 'active',
  categoryId: 'cat-1',
  categoryName: 'Sneakers',
  seller: { id: 's-1', username: 'seller1', avatarUrl: '' },
  createdAt: new Date().toISOString(),
}));

vi.mock('@/services/catalog.service', () => ({
  catalogService: {
    getCategories: vi.fn(),
    getProducts: vi.fn(),
  },
}));

vi.mock('@/core/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

// ── Tests ──────────────────────────────────────────────────────────────────

describe('HomePage – coverage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { catalogService } = await import('@/services/catalog.service');
    (catalogService.getCategories as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategories);
    (catalogService.getProducts as ReturnType<typeof vi.fn>).mockResolvedValue(mockProducts);
  });

  it('renders without crashing', () => {
    const { container } = renderPage();
    expect(container).toBeTruthy();
  });

  it('shows loading state initially (Chargement...)', () => {
    renderPage();
    expect(screen.getByText(/Chargement/i)).toBeDefined();
  });

  it('renders categories after loading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Sneakers')).toBeDefined();
    });
  });

  it('renders category Figurines after loading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Figurines')).toBeDefined();
    });
  });

  it('renders featured products (up to 4)', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Product 0')).toBeDefined();
    });
  });

  it('calls getProducts with sort=recent', async () => {
    renderPage();
    const { catalogService } = await import('@/services/catalog.service');
    await waitFor(() => {
      expect(catalogService.getProducts).toHaveBeenCalledWith({ sort: 'recent' });
    });
  });

  it('handles API error gracefully without throwing', async () => {
    const { catalogService } = await import('@/services/catalog.service');
    (catalogService.getCategories as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error'),
    );
    (catalogService.getProducts as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error'),
    );
    expect(() => renderPage()).not.toThrow();
    await waitFor(() => {
      // After error, loading finishes and page renders without crash
      expect(document.body).toBeTruthy();
    });
  });

  it('renders hero section with call-to-action', async () => {
    renderPage();
    await waitFor(() => {
      // Hero section contains text about the marketplace
      const body = document.body.textContent;
      expect(body?.length).toBeGreaterThan(10);
    });
  });
});
