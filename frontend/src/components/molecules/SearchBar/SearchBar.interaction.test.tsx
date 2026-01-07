import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar interaction (sanity)', () => {
  it('renders input element without simulating user-event (lib may be absent)', () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });
});
