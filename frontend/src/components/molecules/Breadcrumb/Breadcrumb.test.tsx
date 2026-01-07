import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders links passed as items within router', () => {
    const items = [{ label: 'Home', to: '/' }, { label: 'Cat', to: '/cat' }];
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Cat')).toBeInTheDocument();
  });
});
