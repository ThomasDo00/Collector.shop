import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge variants', () => {
  it('renders various variants without error', () => {
    render(
      <div>
        <Badge variant="primary">P</Badge>
        <Badge variant="success">S</Badge>
        <Badge variant="error">E</Badge>
      </div>
    );
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
  });
});
