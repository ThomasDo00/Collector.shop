import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('renders input element', () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });
});
