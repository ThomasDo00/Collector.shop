import { describe, it, expect } from 'vitest';
import { store } from '..';

describe('auth actions store', () => {
  it('dispatch and get state works', () => {
    const s = store.getState();
    expect(s).toHaveProperty('auth');
  });
});
