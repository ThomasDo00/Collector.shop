import { z } from 'zod';

// User roles
export const UserRole = {
  VISITOR: 'visitor',
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// User status
export const UserStatus = {
  PENDING: 'pending', // Email not verified
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// Zod schema for validation
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  passwordHash: z.string(),
  role: z.enum([UserRole.VISITOR, UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN]),
  status: z.enum([UserStatus.PENDING, UserStatus.ACTIVE, UserStatus.SUSPENDED, UserStatus.BANNED]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
  mfaEnabled: z.boolean().default(false),
  mfaSecret: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

// DTO for creating a user
export const createUserDTOSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^\w+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type CreateUserDTO = z.infer<typeof createUserDTOSchema>;

// DTO for user response (without sensitive data)
export const userResponseSchema = userSchema.omit({ passwordHash: true });
export type UserResponse = z.infer<typeof userResponseSchema>;
