import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from './Alert';

describe('Alert - Coverage Tests', () => {
  it('renders success variant with message', () => {
    render(<Alert variant="success" message="Success message" />);
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('renders error variant with message', () => {
    render(<Alert variant="error" message="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('renders warning variant with message', () => {
    render(<Alert variant="warning" message="Warning message" />);
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('renders info variant with message', () => {
    render(<Alert variant="info" message="Info message" />);
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('renders with title and message', () => {
    render(<Alert variant="success" title="Success Title" message="Success message" />);
    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Alert variant="success" message="Test" onClose={onClose} />);

    const closeButton = screen.getByLabelText('Fermer');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose is not provided', () => {
    render(<Alert variant="success" message="Test" />);
    expect(screen.queryByLabelText('Fermer')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Alert variant="success" message="Test" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with children instead of message', () => {
    render(
      <Alert variant="success" message="">
        <div>Custom content</div>
      </Alert>
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('has correct ARIA role', () => {
    const { container } = render(<Alert variant="error" message="Error" />);
    const alert = container.firstChild;
    expect(alert).toHaveAttribute('role', 'alert');
  });
});
