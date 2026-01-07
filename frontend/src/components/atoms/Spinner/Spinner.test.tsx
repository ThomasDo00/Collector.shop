import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('renders with default label and role', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-label', 'Chargement...');
  });

  it('accepts custom label and classes', () => {
    render(<Spinner label="Loading now" className="my-class" />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-label', 'Loading now');
    expect(el.className).toContain('my-class');
  });
});
