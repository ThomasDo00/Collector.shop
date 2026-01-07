import { describe, it, expect, vi } from 'vitest';
import authService from '../../../services/auth.service';
import * as client from '../../../services/api/client';

describe('auth.service error paths', () => {
  it('login propagates errors', async () => {
    const mockPost = vi.fn().mockRejectedValue(new Error('fail'));
    vi.spyOn(client, 'apiClient' as unknown as 'apiClient').mockReturnValue({ post: mockPost } as never);
    await expect(authService.login({} as unknown as Parameters<typeof authService.login>[0])).rejects.toThrow();
  });
});
