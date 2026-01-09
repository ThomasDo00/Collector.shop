import { describe, it, expect, beforeEach, vi } from 'vitest';
vi.mock('bcrypt', () => ({
  default: {
    hash: async () => 'hashed',
    compare: async () => true,
  },
}));
import { User, UserRole, UserStatus, createUserDTOSchema } from '@modules/user/domain/entities/User';
import { RegisterUser } from '@modules/user/domain/usecases/RegisterUser';
import type { IUserRepository } from '@modules/user/domain/ports/IUserRepository';

describe('RegisterUserUseCase Integration', () => {
  let registerUseCase: RegisterUser;
  let mockRepository: IUserRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findByUsername: vi.fn().mockResolvedValue(null),
      emailExists: vi.fn().mockResolvedValue(false),
      usernameExists: vi.fn().mockResolvedValue(false),
      create: vi.fn().mockResolvedValue({
        id: 'new-id',
        email: 'newuser@test.com',
        username: 'newuser',
        passwordHash: 'hash',
        role: UserRole.BUYER,
        status: UserStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    registerUseCase = new RegisterUser(mockRepository);
  });


  it('should create a new user with valid input', async () => {
    const input = {
      email: 'newuser@test.com',
      username: 'newuser',
      password: 'SecurePass123!',
    };

    const result = await registerUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.email).toBe('newuser@test.com');
    expect(result.username).toBe('newuser');
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should reject existing email', async () => {
    (mockRepository.emailExists as any).mockResolvedValueOnce(true);

    await expect(
      registerUseCase.execute({
        email: 'existing@test.com',
        username: 'newuser',
        password: 'SecurePass123!',
      })
    ).rejects.toThrow();
  });

  it('should reject existing username', async () => {
    (mockRepository.usernameExists as any).mockResolvedValueOnce(true);

    await expect(
      registerUseCase.execute({
        email: 'newuser@test.com',
        username: 'existinguser',
        password: 'SecurePass123!',
      })
    ).rejects.toThrow();
  });
});
