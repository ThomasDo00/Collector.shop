import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setTokens, clearTokens, hasStoredAuth } from './client';

describe('API Client Utility Functions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('token operations are synchronous', () => {
    const start = Date.now();
    setTokens('test', 'test');
    const end = Date.now();
    expect(end - start).toBeLessThan(100);
  });

  it('tokens are correctly isolated in localStorage', () => {
    setTokens('access123', 'refresh456');
    expect(localStorage.getItem('accessToken')).toBe('access123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh456');
  });

  it('clearing tokens removes exactly those keys', () => {
    localStorage.setItem('other', 'value');
    setTokens('a', 'r');
    clearTokens();
    expect(localStorage.getItem('other')).toBe('value');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('hasStoredAuth checks only accessToken', () => {
    localStorage.setItem('refreshToken', 'refresh');
    expect(hasStoredAuth()).toBe(false);
    localStorage.setItem('accessToken', 'access');
    expect(hasStoredAuth()).toBe(true);
  });

  it('handle edge case empty tokens', () => {
    setTokens('', '');
    expect(hasStoredAuth()).toBe(false);
  });

  it('handle edge case very long tokens', () => {
    const longToken = 'x'.repeat(10000);
    setTokens(longToken, longToken);
    expect(localStorage.getItem('accessToken')).toBe(longToken);
    expect(hasStoredAuth()).toBe(true);
  });

  it('tokens are readable after setting', () => {
    setTokens('abc', 'def');
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    expect(access).toBe('abc');
    expect(refresh).toBe('def');
  });

  it('multiple operations work correctly', () => {
    setTokens('1', '1');
    expect(hasStoredAuth()).toBe(true);
    setTokens('2', '2');
    expect(hasStoredAuth()).toBe(true);
    clearTokens();
    expect(hasStoredAuth()).toBe(false);
    setTokens('3', '3');
    expect(hasStoredAuth()).toBe(true);
  });
});
