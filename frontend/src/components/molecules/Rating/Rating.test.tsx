import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Rating from './Rating';

describe('Rating', () => {
  it('renders readable score (localized)', () => {
    render(<Rating value={4.5} /> as any);
    // component renders localized number (eg. '4,5')
    expect(screen.getByText((content) => /4[.,]5/.test(content))).toBeTruthy();
  });
});
