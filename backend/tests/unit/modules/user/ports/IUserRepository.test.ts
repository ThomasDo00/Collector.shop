import { describe, it, expect } from 'vitest';

describe('IUserRepository port', () => {
  it('interface file exists', async () => {
    const mod = await import('../../../../../src/modules/user/domain/ports/IUserRepository.js');
    expect(mod).toBeDefined();
  });
});
