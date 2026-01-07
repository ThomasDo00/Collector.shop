import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Logo from './Logo';

describe('Logo', () => {
  it('renders text when showText is true', () => {
    render(<Logo showText={true} linkToHome={false} />);
    expect(screen.getByText(/Collector/)).toBeInTheDocument();
  });

  it('renders icon-only when showText is false', () => {
    const { container } = render(<Logo showText={false} linkToHome={false} />);
    expect(container.querySelector('div')).toBeTruthy();
  });
});
