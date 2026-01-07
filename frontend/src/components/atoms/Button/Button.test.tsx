import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders children and applies aria when loading', () => {
    render(<Button isLoading>Submit</Button>);
    // Spinner uses sr-only text when loading
    expect(screen.getByLabelText(/Chargement/i)).toBeInTheDocument();
  });

  it('renders left and right icons', () => {
    render(
      <Button leftIcon={<span data-testid="left">L</span>} rightIcon={<span data-testid="right">R</span>}>
        Text
      </Button>
    );

    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Go</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });
});
