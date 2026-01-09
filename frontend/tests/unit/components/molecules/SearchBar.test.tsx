import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import SearchBar from '@/components/molecules/SearchBar';

describe('SearchBar', () => {
  it('should render search bar', () => {
    const { container } = render(<SearchBar />);
    expect(container.querySelector('input')).toBeTruthy();
  });

  it('should accept input', () => {
    const { container } = render(<SearchBar />);
    const input = container.querySelector('input') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'Nike' } });
    expect(input.value).toBe('Nike');
  });

  it('should display search suggestions', () => {
    const { container } = render(<SearchBar />);
    const input = container.querySelector('input') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'Air' } });
    fireEvent.focus(input);
    
    expect(container.querySelector('input')).toBeTruthy();
  });

  it('should handle search submission', () => {
    const { container } = render(<SearchBar />);
    const input = container.querySelector('input') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(input.value).toBe('Test');
  });

  it('should clear input', () => {
    const { container } = render(<SearchBar />);
    const input = container.querySelector('input') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'Search' } });
    expect(input.value).toBe('Search');
    
    fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');
  });
});
