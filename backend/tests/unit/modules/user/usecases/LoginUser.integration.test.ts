import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginUser } from '@modules/user/domain/usecases/LoginUser';

vi.mock('bcrypt', () => ({
  default: {
    compare: async () => true,
    hash: async () => 'hashed',
  },
}));
import { UserRole, UserStatus } from '@modules/user/domain/entities/User';
import type { IUserRepository } from '@modules/user/domain/ports/IUserRepository';

describe('LoginUserUseCase Integration', () => {
  let loginUseCase: LoginUser;
  let mockRepository: IUserRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    loginUseCase = new LoginUser(mockRepository);
  });

  it('should login with valid credentials', async () => {
    const testUser = {
      id: 'user-id',
      email: 'user@test.com',
      username: 'testuser',
      passwordHash: '$2a$12$encrypted', // Mock hashed password
      role: UserRole.BUYER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockRepository.findByEmail as any).mockResolvedValueOnce(testUser);

    const result = await loginUseCase.execute({
      emailOrUsername: 'user@test.com',
      password: 'password123',
    });

    expect(result).toBeDefined();
  });

  it('should reject non-existent user', async () => {
    (mockRepository.findByEmail as any).mockResolvedValueOnce(null);

    await expect(
      loginUseCase.execute({
        emailOrUsername: 'nonexistent@test.com',
        password: 'password123',
      })
    ).rejects.toThrow();
  });

  it('should reject suspended user', async () => {
    (mockRepository.findByEmail as any).mockResolvedValueOnce({
      id: 'user-id',
      email: 'user@test.com',
      status: UserStatus.SUSPENDED,
    });

    await expect(
      loginUseCase.execute({
        emailOrUsername: 'user@test.com',
        password: 'password123',
      })
    ).rejects.toThrow();
  });
});
