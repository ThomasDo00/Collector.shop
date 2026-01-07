import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button variants', () => {
  it('renders primary and danger variants', () => {
    render(<div><Button variant="primary">P</Button><Button variant="danger">D</Button></div>);
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});
