import { describe, it, expect } from 'vitest';
import authReducer from '../authSlice';

describe('auth slice', () => {
  it('has reducer function', () => {
    expect(typeof authReducer).toBe('function');
  });
});
