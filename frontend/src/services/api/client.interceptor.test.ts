import { describe, it, expect } from 'vitest';
import apiClient from './client';

describe('api client interceptors (sanity)', () => {
  it('has interceptors arrays', () => {
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });
});
