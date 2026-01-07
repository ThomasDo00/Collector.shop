import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from './Input';

describe('Input - Coverage Tests', () => {
  it('renders with leftIcon and rightIcon', () => {
    render(
      <Input
        label="Test Input"
        leftIcon={<span>Left</span>}
        rightIcon={<span>Right</span>}
        name="test"
      />
    );

    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('applies correct classes with leftIcon', () => {
    const { container } = render(
      <Input
        label="Test"
        leftIcon={<span>Icon</span>}
        name="test"
      />
    );

    const input = container.querySelector('input');
    expect(input).toHaveClass('pl-10');
  });

  it('applies correct classes with rightIcon', () => {
    const { container } = render(
      <Input
        label="Test"
        rightIcon={<span>Icon</span>}
        name="test"
      />
    );

    const input = container.querySelector('input');
    expect(input).toHaveClass('pr-10');
  });

  it('uses id prop when provided', () => {
    render(<Input id="custom-id" name="test" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('uses name as id when id not provided', () => {
    render(<Input name="test-name" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'test-name');
  });

  it('renders helpText when no error', () => {
    render(
      <Input
        label="Test"
        helpText="This is help text"
        name="test"
      />
    );

    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('does not render helpText when error exists', () => {
    render(
      <Input
        label="Test"
        helpText="This is help text"
        error="This is an error"
        name="test"
      />
    );

    expect(screen.queryByText('This is help text')).not.toBeInTheDocument();
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('sets aria-describedby to error id when error exists', () => {
    render(
      <Input
        label="Test"
        error="Error message"
        name="test"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-error');
  });

  it('sets aria-describedby to help id when helpText exists and no error', () => {
    render(
      <Input
        label="Test"
        helpText="Help text"
        name="test"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-help');
  });

  it('does not set aria-describedby when no error or helpText', () => {
    render(<Input label="Test" name="test" />);

    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('renders with fullWidth false', () => {
    const { container } = render(
      <Input label="Test" name="test" fullWidth={false} />
    );

    const wrapper = container.firstChild;
    expect(wrapper).not.toHaveClass('w-full');
  });

  it('renders error with role alert', () => {
    render(
      <Input
        label="Test"
        error="Error message"
        name="test"
      />
    );

    const errorElement = screen.getByRole('alert');
    expect(errorElement).toHaveTextContent('Error message');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Input label="Test" name="test" className="custom-class" />
    );

    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Input ref={ref} name="test" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
