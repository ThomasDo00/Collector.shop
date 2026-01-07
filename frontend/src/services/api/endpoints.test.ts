import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS } from './endpoints';

describe('API_ENDPOINTS', () => {
  it('contains auth paths and functions return expected strings', () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/users/login');
    expect(API_ENDPOINTS.USERS.PROFILE()).toBe('/users/profile');
    expect(API_ENDPOINTS.USERS.PROFILE('abc')).toBe('/users/abc/profile');
    expect(API_ENDPOINTS.CATALOG.PRODUCT('p1')).toBe('/catalog/products/p1');
  });
});
