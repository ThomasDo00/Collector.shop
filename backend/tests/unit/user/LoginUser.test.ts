import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { LoginUser, InvalidCredentialsError, EmailNotVerifiedError, AccountSuspendedError, AccountBannedError } from '@modules/user/domain/usecases/LoginUser.js';
import { IUserRepository } from '@modules/user/domain/ports/IUserRepository.js';
import { User, UserRole, UserStatus } from '@modules/user/domain/entities/User.js';

describe('LoginUser Use Case', () => {
  let loginUser: LoginUser;
  let mockUserRepository: IUserRepository;
  let mockUser: User;

  beforeEach(() => {
    // Create mock user
    mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKOQ.D4.au', // hashed "Password123!"
      role: UserRole.BUYER,
      status: UserStatus.ACTIVE,
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create mock repository
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      emailExists: vi.fn(),
      usernameExists: vi.fn(),
    };

    loginUser = new LoginUser(mockUserRepository);
  });

  describe('Successful login', () => {
    it('should authenticate user with email and return user data', async () => {
      // Mock password verification
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.update).mockResolvedValue(mockUser);

      const result = await loginUser.execute({
        emailOrUsername: 'test@example.com',
        password: 'Password123!',
      });

      expect(result).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
        status: mockUser.status,
        mfaEnabled: false,
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        lastLoginAt: expect.any(Date),
      });
    });

    it('should authenticate user with username and return user data', async () => {
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.update).mockResolvedValue(mockUser);

      const result = await loginUser.execute({
        emailOrUsername: 'testuser',
        password: 'Password123!',
      });

      expect(result).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
        status: mockUser.status,
        mfaEnabled: false,
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('testuser');
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('testuser');
    });
  });

  describe('Failed login - Invalid credentials', () => {
    it('should throw InvalidCredentialsError when user does not exist', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValue(null);

      await expect(
        loginUser.execute({
          emailOrUsername: 'nonexistent@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw InvalidCredentialsError when password is incorrect', async () => {
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);

      await expect(
        loginUser.execute({
          emailOrUsername: 'test@example.com',
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe('Failed login - Account status', () => {
    it('should throw EmailNotVerifiedError when account status is PENDING', async () => {
      const pendingUser = { ...mockUser, status: UserStatus.PENDING };
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(pendingUser);

      await expect(
        loginUser.execute({
          emailOrUsername: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(EmailNotVerifiedError);
    });

    it('should throw AccountSuspendedError when account status is SUSPENDED', async () => {
      const suspendedUser = { ...mockUser, status: UserStatus.SUSPENDED };
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(suspendedUser);

      await expect(
        loginUser.execute({
          emailOrUsername: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(AccountSuspendedError);
    });

    it('should throw AccountBannedError when account status is BANNED', async () => {
      const bannedUser = { ...mockUser, status: UserStatus.BANNED };
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(bannedUser);

      await expect(
        loginUser.execute({
          emailOrUsername: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(AccountBannedError);
    });
  });

  describe('Input validation', () => {
    it('should throw validation error when emailOrUsername is empty', async () => {
      await expect(
        loginUser.execute({
          emailOrUsername: '',
          password: 'Password123!',
        })
      ).rejects.toThrow();
    });

    it('should throw validation error when password is empty', async () => {
      await expect(
        loginUser.execute({
          emailOrUsername: 'test@example.com',
          password: '',
        })
      ).rejects.toThrow();
    });
  });
});
