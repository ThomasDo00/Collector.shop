import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar status indicator', () => {
  it('shows online status when isOnline true', () => {
    render(<Avatar alt="Me" showStatus isOnline />);
    const status = screen.getByLabelText('En ligne');
    expect(status).toBeInTheDocument();
  });
});
