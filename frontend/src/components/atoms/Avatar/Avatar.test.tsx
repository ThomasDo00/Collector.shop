import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('renders image when src provided', () => {
    render(<Avatar src="/img.jpg" alt="User" />);
    const img = screen.getByAltText('User');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/img.jpg');
  });

  it('renders fallback initials when no src', () => {
    render(<Avatar alt="John Doe" />);
    expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
    expect(screen.getByLabelText('John Doe').textContent).toMatch(/JD|J/);
  });
});
