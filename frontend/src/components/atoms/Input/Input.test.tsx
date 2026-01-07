import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from './Input';

describe('Input', () => {
  it('renders label and helpText when provided', () => {
    render(<Input label="Name" name="name" helpText="Helper" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Helper')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'name');
  });

  it('shows error message and aria-invalid when error present', () => {
    render(<Input label="Email" name="email" error="Required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });
});
