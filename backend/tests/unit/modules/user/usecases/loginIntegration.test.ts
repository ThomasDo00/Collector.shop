import { describe, it, expect } from 'vitest';

describe('LoginUser integration (mock)', () => {
  it('can import LoginUser usecase', async () => {
    const mod = await import('../../../../../src/modules/user/domain/usecases/LoginUser.js');
    expect(mod).toBeDefined();
  });
});
