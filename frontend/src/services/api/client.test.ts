import { describe, it, expect, beforeEach, vi } from 'vitest';
import apiClient, { setTokens, clearTokens, hasStoredAuth } from './client';

describe('api client token helpers and interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('setTokens / clearTokens / hasStoredAuth work with localStorage', () => {
    expect(hasStoredAuth()).toBe(false);
    setTokens('a', 'r');
    expect(localStorage.getItem('accessToken')).toBe('a');
    expect(localStorage.getItem('refreshToken')).toBe('r');
    expect(hasStoredAuth()).toBe(true);
    clearTokens();
    expect(hasStoredAuth()).toBe(false);
  });

  it('request interceptor adds Authorization header when token present', async () => {
    localStorage.setItem('accessToken', 'tok123');

    // Grab the registered request interceptor
    const handler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Promise<Record<string, unknown>> }> }).handlers[0].fulfilled;
    const config = { headers: {} } as Record<string, unknown>;

    const out = (await handler(config)) as Record<string, Record<string, unknown>>;

    expect(out.headers.Authorization).toBe('Bearer tok123');
  });

  // NOTE: complex response/refresh flow is tested manually; avoid network/XHR in unit test runner.
});
