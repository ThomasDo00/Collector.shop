import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders hero title and categories list', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Trouvez votre prochain tresor/)).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('renders favorite buttons for products', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const favoriteButtons = screen.getAllByLabelText(/Ajouter aux favoris/i);
    expect(favoriteButtons.length).toBeGreaterThan(0);
  });
});
