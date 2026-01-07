import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Logo from './Logo';

describe('Logo link', () => {
  it('renders link when linkToHome true within router', () => {
    render(
      <MemoryRouter>
        <Logo linkToHome={true} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Accueil/)).toBeInTheDocument();
  });
});
