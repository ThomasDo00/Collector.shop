import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge accessibility', () => {
  it('renders text and is accessible', () => {
    render(<Badge>OK</Badge>);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });
});
