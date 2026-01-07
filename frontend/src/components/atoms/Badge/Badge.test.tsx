import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it('renders children and optional icon', () => {
    render(<Badge icon={<span data-testid="ic">i</span>}>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });
});
