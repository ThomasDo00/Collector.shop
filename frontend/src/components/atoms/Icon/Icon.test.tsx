import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Icon from './Icon';

describe('Icon', () => {
  it('renders known icon without crashing', () => {
    const { container } = render(<Icon name="heart" ariaLabel="like" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('returns null for unknown icon name', () => {
    const { container } = render(<Icon name={'unknown' as any} />);
    expect(container.firstChild).toBeNull();
  });
});
