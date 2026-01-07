import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Typography from './Typography';

describe('Typography render', () => {
  it('renders without crashing', () => {
    const { container } = render(<Typography>Text</Typography>);
    expect(container).toBeTruthy();
  });
});
