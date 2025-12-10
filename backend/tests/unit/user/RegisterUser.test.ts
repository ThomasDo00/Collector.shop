import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterUser, EmailAlreadyExistsError, UsernameAlreadyExistsError } from '../../../src/modules/user/domain/usecases/RegisterUser.js';
import { IUserRepository } from '../../../src/modules/user/domain/ports/IUserRepository.js';
import { User, UserRole, UserStatus } from '../../../src/modules/user/domain/entities/User.js';

// Mock repository
const createMockRepository = (): IUserRepository => ({
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByUsername: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  emailExists: vi.fn(),
  usernameExists: vi.fn(),
});

describe('RegisterUser Use Case', () => {
  let mockRepository: IUserRepository;
  let registerUser: RegisterUser;

  const validUserData = {
    email: 'test@example.com',
    username: 'testuser123',
    password: 'Test123!@#',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: validUserData.email,
    username: validUserData.username,
    passwordHash: '$2b$12$hashedpassword',
    role: UserRole.BUYER,
    status: UserStatus.PENDING,
    firstName: validUserData.firstName,
    lastName: validUserData.lastName,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepository = createMockRepository();
    registerUser = new RegisterUser(mockRepository);
  });

  it('should successfully register a new user', async () => {
    vi.mocked(mockRepository.emailExists).mockResolvedValue(false);
    vi.mocked(mockRepository.usernameExists).mockResolvedValue(false);
    vi.mocked(mockRepository.create).mockResolvedValue(mockUser);

    const result = await registerUser.execute(validUserData);

    expect(result).toEqual(mockUser);
    expect(mockRepository.emailExists).toHaveBeenCalledWith(validUserData.email);
    expect(mockRepository.usernameExists).toHaveBeenCalledWith(validUserData.username);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should throw EmailAlreadyExistsError when email is already registered', async () => {
    vi.mocked(mockRepository.emailExists).mockResolvedValue(true);

    await expect(registerUser.execute(validUserData)).rejects.toThrow(EmailAlreadyExistsError);
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should throw UsernameAlreadyExistsError when username is already taken', async () => {
    vi.mocked(mockRepository.emailExists).mockResolvedValue(false);
    vi.mocked(mockRepository.usernameExists).mockResolvedValue(true);

    await expect(registerUser.execute(validUserData)).rejects.toThrow(UsernameAlreadyExistsError);
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should reject invalid email format', async () => {
    const invalidData = { ...validUserData, email: 'invalid-email' };

    await expect(registerUser.execute(invalidData)).rejects.toThrow();
  });

  it('should reject weak passwords', async () => {
    const invalidData = { ...validUserData, password: '12345' };

    await expect(registerUser.execute(invalidData)).rejects.toThrow();
  });

  it('should reject usernames with special characters', async () => {
    const invalidData = { ...validUserData, username: 'user@name!' };

    await expect(registerUser.execute(invalidData)).rejects.toThrow();
  });

  it('should accept usernames with underscores', async () => {
    vi.mocked(mockRepository.emailExists).mockResolvedValue(false);
    vi.mocked(mockRepository.usernameExists).mockResolvedValue(false);
    vi.mocked(mockRepository.create).mockResolvedValue(mockUser);

    const dataWithUnderscore = { ...validUserData, username: 'test_user_123' };

    await expect(registerUser.execute(dataWithUnderscore)).resolves.toBeDefined();
  });
});
