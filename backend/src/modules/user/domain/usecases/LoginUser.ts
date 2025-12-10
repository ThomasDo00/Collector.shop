import bcrypt from 'bcrypt';
import { z } from 'zod';
import { IUserRepository } from '../ports/IUserRepository.js';
import { UserStatus } from '../entities/User.js';

/**
 * Login credentials schema
 */
export const loginCredentialsSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

/**
 * Login result with user ID and role for JWT generation
 */
export interface LoginResult {
  userId: string;
  email: string;
  username: string;
  role: string;
  status: string;
}

/**
 * Login User Use Case
 * Following Single Responsibility Principle (SRP)
 * This class only handles user authentication logic
 */
export class LoginUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(credentials: LoginCredentials): Promise<LoginResult> {
    // Validate input data
    const validatedData = loginCredentialsSchema.parse(credentials);

    // Find user by email or username
    let user = await this.userRepository.findByEmail(validatedData.emailOrUsername);
    if (!user) {
      user = await this.userRepository.findByUsername(validatedData.emailOrUsername);
    }

    // Check if user exists
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Check if user account is active
    if (user.status === UserStatus.BANNED) {
      throw new AccountBannedError();
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AccountSuspendedError();
    }

    if (user.status === UserStatus.PENDING) {
      throw new EmailNotVerifiedError();
    }

    // Update last login timestamp
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Return user information for JWT generation
    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
    };
  }
}

// Domain errors
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email/username or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Email address not verified. Please check your email to verify your account.');
    this.name = 'EmailNotVerifiedError';
  }
}

export class AccountSuspendedError extends Error {
  constructor() {
    super('Your account has been suspended. Please contact support for assistance.');
    this.name = 'AccountSuspendedError';
  }
}

export class AccountBannedError extends Error {
  constructor() {
    super('Your account has been banned. Please contact support if you believe this is an error.');
    this.name = 'AccountBannedError';
  }
}
