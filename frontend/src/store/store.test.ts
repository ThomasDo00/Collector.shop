import { describe, it, expect } from 'vitest';
import { store } from './index';

describe('Redux store', () => {
  it('has auth slice in state', () => {
    const state = store.getState();
    expect(state).toHaveProperty('auth');
  });
});
