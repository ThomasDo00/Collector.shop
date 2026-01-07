import { describe, it, expect, vi } from 'vitest';
import authService from './auth.service';
import * as client from './api/client';

describe('auth service invalid responses', () => {
  it('refreshToken throws when api fails', async () => {
    // Mock the apiClient.post method directly
    if (client.apiClient && typeof client.apiClient.post === 'function') {
      vi.spyOn(client.apiClient, 'post').mockRejectedValue(new Error('nope'));
    }

    await expect(authService.refreshToken('x')).rejects.toThrow();
  });
});
