import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from './auth.service';

// Mock the api client and token helpers
vi.mock('./api/client', () => {
  const mockPost = vi.fn();
  return {
    __esModule: true,
    default: { post: mockPost },
    apiClient: { post: mockPost },
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    hasStoredAuth: vi.fn(() => false),
  };
});

import * as client from './api/client';

describe('authService', () => {
  const mocked = vi.mocked(client as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login should call api and store tokens', async () => {
    const resp = { data: { data: { accessToken: 'a', refreshToken: 'r', user: { id: '1' } } } };
    mocked.apiClient.post.mockResolvedValue(resp);

    const result = await authService.login({ email: 't', password: 'p' } as any);

    expect(result).toEqual(resp.data.data);
    expect(mocked.setTokens).toHaveBeenCalledWith('a', 'r');
  });

  it('register should call api and return data', async () => {
    const resp = { data: { data: { id: 'u1' } } };
    mocked.apiClient.post.mockResolvedValue(resp);

    const r = await authService.register({ email: 'x' } as any);
    expect(r).toEqual(resp.data.data);
    expect(mocked.default.post).toHaveBeenCalled();
  });

  it('refreshToken should set new tokens and return them', async () => {
    const resp = { data: { data: { accessToken: 'na', refreshToken: 'nr' } } };
    mocked.apiClient.post.mockResolvedValue(resp);

    const tokens = await authService.refreshToken('rt');
    expect(tokens).toEqual(resp.data.data);
    expect(mocked.setTokens).toHaveBeenCalledWith('na', 'nr');
  });

  it('logout should clear tokens even if api fails', async () => {
    mocked.apiClient.post.mockRejectedValue(new Error('fail'));

    await authService.logout();
    expect(mocked.clearTokens).toHaveBeenCalled();
  });

  it('hasAuth delegates to hasStoredAuth', () => {
    mocked.hasStoredAuth.mockReturnValue(true);
    expect(authService.hasAuth()).toBe(true);
  });

  it('clearAuth delegates to clearTokens', () => {
    authService.clearAuth();
    expect(mocked.clearTokens).toHaveBeenCalled();
  });
});
