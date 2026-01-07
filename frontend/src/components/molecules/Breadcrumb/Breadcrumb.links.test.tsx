import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

describe('Breadcrumb links', () => {
  it('renders provided link labels within Router', () => {
    const items = [{ label: 'One', to: '/' }];
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    expect(screen.getByText('One')).toBeInTheDocument();
  });
});
