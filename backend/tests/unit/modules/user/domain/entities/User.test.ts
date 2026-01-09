import { describe, it, expect } from 'vitest';
import { userSchema, createUserDTOSchema, UserRole, UserStatus } from '@modules/user/domain/entities/User.js';

describe('User Schema Validation', () => {
  it('should validate correct user data', () => {
    const validUser = {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed_password',
      role: UserRole.BUYER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = userSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidUser = {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      email: 'invalid-email',
      username: 'testuser',
      passwordHash: 'hashed_password',
      role: UserRole.BUYER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = userSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should validate create user DTO', () => {
    const createUserDTO = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'SecurePass123!',
    };
    const result = createUserDTOSchema.safeParse(createUserDTO);
    expect(result.success).toBe(true);
  });

  it('should have VISITOR, BUYER, SELLER, ADMIN roles', () => {
    expect(UserRole.VISITOR).toBeDefined();
    expect(UserRole.BUYER).toBeDefined();
    expect(UserRole.SELLER).toBeDefined();
    expect(UserRole.ADMIN).toBeDefined();
  });
});
