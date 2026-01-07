import { describe, it, expect } from 'vitest';
import Icon, { type IconName } from './Icon';
import { render } from '@testing-library/react';

describe('Icon unknown warning', () => {
  it('returns null and does not throw for unknown name', () => {
    const { container } = render(<Icon name={'nope' as IconName} />);
    expect(container.firstChild).toBeNull();
  });
});
