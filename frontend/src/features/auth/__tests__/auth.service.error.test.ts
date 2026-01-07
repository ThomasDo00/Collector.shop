import { describe, it, expect, vi } from 'vitest';
import authService from '../../../services/auth.service';
import * as client from '../../../services/api/client';

describe('auth.service error paths', () => {
  it('login propagates errors', async () => {
    vi.spyOn(client, 'apiClient' as unknown as 'apiClient').mockImplementation(() => ({ post: vi.fn().mockRejectedValue(new Error('fail')) }));
    await expect(authService.login({} as unknown as Parameters<typeof authService.login>[0])).rejects.toThrow();
  });
});
