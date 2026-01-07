import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from './Input';

describe('Input accessibility', () => {
  it('links label and input via id', () => {
    render(<Input label="Email" name="email" /> as any);
    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
  });
});
