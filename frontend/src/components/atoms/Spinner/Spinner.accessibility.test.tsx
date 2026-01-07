import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner accessibility', () => {
  it('has role status and sr-only text', () => {
    render(<Spinner />);
    const s = screen.getByRole('status');
    expect(s).toBeInTheDocument();
    expect(s.querySelector('.sr-only')).toBeTruthy();
  });
});
