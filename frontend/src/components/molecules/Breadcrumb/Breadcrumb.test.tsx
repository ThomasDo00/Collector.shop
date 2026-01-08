import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders links passed as items within router', () => {
    const items = [{ label: 'Home', href: '/' }, { label: 'Cat', href: '/cat' }];
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Cat')).toBeInTheDocument();
  });

  it('returns null when items array is empty', () => {
    const { container } = render(
      <MemoryRouter>
        <Breadcrumb items={[]} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders last item without link', () => {
    const items = [
      { label: 'Category', href: '/category' },
      { label: 'Product' }, // No href for last item
    ];
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );

    const lastItem = screen.getByText('Product');
    expect(lastItem.tagName).toBe('SPAN');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders items with href as links', () => {
    const items = [
      { label: 'First', href: '/first' },
      { label: 'Second', href: '/second' },
      { label: 'Last' },
    ];
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );

    const firstLink = screen.getByText('First').closest('a');
    const secondLink = screen.getByText('Second').closest('a');

    expect(firstLink).toHaveAttribute('href', '/first');
    expect(secondLink).toHaveAttribute('href', '/second');
  });
});
