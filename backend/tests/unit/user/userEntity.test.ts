import { describe, it, expect } from 'vitest';

describe('User entity schema', () => {
  it('validates a correct user object', async () => {
    const mod = await import('../../../src/modules/user/domain/entities/User.js');
    const now = new Date();
    const user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'a@b.com',
      username: 'user_1',
      passwordHash: 'hash',
      role: mod.UserRole.BUYER,
      status: mod.UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    const parsed = mod.userSchema.safeParse(user);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid email', async () => {
    const mod = await import('../../../src/modules/user/domain/entities/User.js');
    const now = new Date();
    const user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'not-an-email',
      username: 'u1',
      passwordHash: 'hash',
      role: mod.UserRole.BUYER,
      status: mod.UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    const parsed = mod.userSchema.safeParse(user);
    expect(parsed.success).toBe(false);
  });
});
