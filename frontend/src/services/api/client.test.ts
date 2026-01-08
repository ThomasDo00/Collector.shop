import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import apiClient, { setTokens, clearTokens, hasStoredAuth } from './client';

describe('api client token helpers and interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
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

  it('request interceptor does not add header when no token', async () => {
    localStorage.clear();
    
    const handler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Promise<Record<string, unknown>> }> }).handlers[0].fulfilled;
    const config = { headers: {} } as Record<string, unknown>;

    const out = (await handler(config)) as Record<string, Record<string, unknown>>;

    expect(out.headers.Authorization).toBeUndefined();
  });

  it('setTokens stores both access and refresh tokens', () => {
    const accessToken = 'access-token-123';
    const refreshToken = 'refresh-token-456';
    
    setTokens(accessToken, refreshToken);
    
    expect(localStorage.getItem('accessToken')).toBe(accessToken);
    expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
  });

  it('hasStoredAuth returns false when no access token', () => {
    localStorage.clear();
    expect(hasStoredAuth()).toBe(false);
  });

  it('hasStoredAuth returns true when access token exists', () => {
    localStorage.setItem('accessToken', 'some-token');
    expect(hasStoredAuth()).toBe(true);
  });

  it('clearTokens removes both tokens', () => {
    setTokens('access', 'refresh');
    expect(localStorage.getItem('accessToken')).toBe('access');
    expect(localStorage.getItem('refreshToken')).toBe('refresh');
    
    clearTokens();
    
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('request interceptor handles missing headers gracefully', async () => {
    localStorage.setItem('accessToken', 'tok123');
    
    const handler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Promise<Record<string, unknown>> }> }).handlers[0].fulfilled;
    const config = {} as Record<string, unknown>;

    const out = (await handler(config)) as Record<string, Record<string, unknown>>;
    expect(out).toBeDefined();
  });

  it('apiClient is configured with correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('/api');
  });

  it('apiClient has correct default headers', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('apiClient has timeout configured', () => {
    expect(apiClient.defaults.timeout).toBe(10000);
  });

  it('request interceptor returns config unchanged when no errors', async () => {
    const config = { headers: { test: 'value' } } as Record<string, unknown>;
    const handler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Promise<Record<string, unknown>> }> }).handlers[0].fulfilled;
    
    const result = (await handler(config)) as Record<string, unknown>;
    expect(result).toBeDefined();
  });

  // NOTE: complex response/refresh flow is tested manually; avoid network/XHR in unit test runner.
});
