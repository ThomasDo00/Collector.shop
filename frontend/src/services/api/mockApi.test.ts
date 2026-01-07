import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS } from './endpoints';

describe('mock API quick checks', () => {
  it('endpoint constants present', () => {
    expect(API_ENDPOINTS.HEALTH).toBe('/health');
  });
});
