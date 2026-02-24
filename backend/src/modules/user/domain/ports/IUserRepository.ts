import { User, CreateUserDTO } from '../entities/User.js';

/**
 * User Repository Interface (Port)
 * Following Dependency Inversion Principle (DIP)
 * Domain defines the interface, infrastructure implements it
 */
export interface IUserRepository {
  /**
   * Find a user by their unique ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by their email address
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by their username
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Create a new user
   * Accepts the create DTO without the plaintext password; instead requires a passwordHash.
   */
  create(userData: Omit<CreateUserDTO, 'password'> & { passwordHash: string }): Promise<User>;

  /**
   * Update an existing user
   */
  update(id: string, userData: Partial<User>): Promise<User | null>;

  /**
   * Delete a user (soft delete / anonymize for RGPD)
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if email already exists
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Check if username already exists
   */
  usernameExists(username: string): Promise<boolean>;

  /**
   * Update MFA settings for a user
   */
  updateMfa(id: string, mfaEnabled: boolean, mfaSecret: string | null): Promise<User | null>;
}
