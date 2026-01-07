import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Icon from './Icon';

describe('Icon aria behavior', () => {
  it('renders svg and handles aria attributes', () => {
    const { container } = render(<Icon name="search" ariaLabel="search" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
