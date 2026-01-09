import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Icon, { type IconName } from '@components/atoms/Icon';

describe('Icon', () => {
  it('should render heart icon', () => {
    const { container } = render(<Icon name="heart" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should render cart icon', () => {
    const { container } = render(<Icon name="cart" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should render user icon', () => {
    const { container } = render(<Icon name="user" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should render with custom className', () => {
    const { container } = render(<Icon name="heart" className="text-red-500" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should render solid icon variant', () => {
    const { container } = render(<Icon name="heart" solid />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should render different icons', () => {
    const icons: IconName[] = ['search', 'menu', 'close', 'check', 'star'];
    icons.forEach((icon) => {
      const { container } = render(<Icon name={icon} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });
});
