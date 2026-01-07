import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar initials behavior', () => {
  it('derives initials from fallback/name correctly', () => {
    render(<Avatar alt="Alice Bob" fallback="Alice Bob" />);
    const el = screen.getByLabelText('Alice Bob');
    expect(el.textContent).toMatch(/AB/);
  });
});
