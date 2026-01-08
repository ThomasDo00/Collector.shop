import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar - Coverage Tests', () => {
  it('renders with placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Search products" />);
    expect(screen.getByPlaceholderText('Search products')).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test query' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('does not call onSearch when query is empty', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox');
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('calls onChange when input changes', () => {
    const onChange = vi.fn();
    render(<SearchBar onSearch={vi.fn()} onChange={onChange} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('shows suggestions when typing', async () => {
    const suggestions = ['Apple', 'Banana', 'Cherry'];
    render(<SearchBar onSearch={vi.fn()} suggestions={suggestions} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });
  });

  it('filters suggestions based on query', async () => {
    const suggestions = ['Apple', 'Banana', 'Cherry'];
    render(<SearchBar onSearch={vi.fn()} suggestions={suggestions} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'app' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
    });
  });

  it('calls onSearch when suggestion is clicked', async () => {
    const onSearch = vi.fn();
    const suggestions = ['Apple', 'Banana'];
    render(<SearchBar onSearch={onSearch} suggestions={suggestions} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      const suggestion = screen.getByText('Apple');
      fireEvent.click(suggestion);
    });

    expect(onSearch).toHaveBeenCalledWith('Apple');
  });

  it('navigates suggestions with arrow keys', async () => {
    const suggestions = ['Apple', 'Banana', 'Cherry'];
    render(<SearchBar onSearch={vi.fn()} suggestions={suggestions} />);

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
  });

  it('selects suggestion with Enter key', async () => {
    const onSearch = vi.fn();
    const suggestions = ['Apple', 'Banana'];
    render(<SearchBar onSearch={onSearch} suggestions={suggestions} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSearch).toHaveBeenCalledWith('Apple');
  });

  it('closes suggestions with Escape key', async () => {
    const suggestions = ['Apple', 'Banana'];
    render(<SearchBar onSearch={vi.fn()} suggestions={suggestions} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('shows clear button when input has value', () => {
    render(<SearchBar onSearch={vi.fn()} value="test" />);
    expect(screen.getByLabelText('Effacer la recherche')).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    const onChange = vi.fn();
    render(<SearchBar onSearch={vi.fn()} onChange={onChange} value="test" />);

    const clearButton = screen.getByLabelText('Effacer la recherche');
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<SearchBar onSearch={vi.fn()} isLoading={true} />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('applies fullWidth class when fullWidth is true', () => {
    const { container } = render(<SearchBar onSearch={vi.fn()} fullWidth />);
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('closes suggestions when clicking outside', async () => {
    const suggestions = ['Apple', 'Banana'];
    render(
      <div>
        <SearchBar onSearch={vi.fn()} suggestions={suggestions} />
        <button>Outside</button>
      </div>
    );

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    const outsideButton = screen.getByText('Outside');
    fireEvent.mouseDown(outsideButton);

    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('limits suggestions to 5 items', async () => {
    const suggestions = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`);
    render(<SearchBar onSearch={vi.fn()} suggestions={suggestions} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'Item' } });

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 5')).toBeInTheDocument();
      expect(screen.queryByText('Item 6')).not.toBeInTheDocument();
    });
  });
});
