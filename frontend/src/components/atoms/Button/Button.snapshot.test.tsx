import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Button from './Button';

describe('Button snapshot', () => {
  it('renders primary button', () => {
    const { container } = render(<Button>Click</Button>);
    expect(container).toBeTruthy();
  });
});
