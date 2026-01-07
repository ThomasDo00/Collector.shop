import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button accessibility', () => {
  it('has aria-busy when loading', () => {
    render(<Button isLoading>Load</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });
});
