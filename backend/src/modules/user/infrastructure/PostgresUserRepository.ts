import { Knex } from 'knex';
import { randomUUID } from 'crypto';
import { User, UserRole, UserStatus, CreateUserDTO } from '../domain/entities/User.js';
import { IUserRepository } from '../domain/ports/IUserRepository.js';

/**
 * PostgreSQL User Repository Implementation
 * Following Liskov Substitution Principle (LSP)
 * Can be swapped with any other implementation of IUserRepository
 */
export class PostgresUserRepository implements IUserRepository {
  private readonly TABLE_NAME = 'users';

  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db(this.TABLE_NAME).where({ id }).first();
    return row ? this.mapToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db(this.TABLE_NAME)
      .whereRaw('LOWER(email) = ?', [email.toLowerCase()])
      .first();
    return row ? this.mapToUser(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.db(this.TABLE_NAME)
      .whereRaw('LOWER(username) = ?', [username.toLowerCase()])
      .first();
    return row ? this.mapToUser(row) : null;
  }

  async create(userData: CreateUserDTO & { passwordHash: string }): Promise<User> {
    const now = new Date();
    const id = randomUUID();

    const [row] = await this.db(this.TABLE_NAME)
      .insert({
        id,
        email: userData.email.toLowerCase(),
        username: userData.username,
        password_hash: userData.passwordHash,
        role: UserRole.BUYER, // Default role
        status: UserStatus.PENDING, // Email verification required
        first_name: userData.firstName || null,
        last_name: userData.lastName || null,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return this.mapToUser(row);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (userData.email) updateData.email = userData.email.toLowerCase();
    if (userData.username) updateData.username = userData.username;
    if (userData.role) updateData.role = userData.role;
    if (userData.status) updateData.status = userData.status;
    if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
    if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
    if (userData.avatarUrl !== undefined) updateData.avatar_url = userData.avatarUrl;
    if (userData.lastLoginAt) updateData.last_login_at = userData.lastLoginAt;

    const [row] = await this.db(this.TABLE_NAME)
      .where({ id })
      .update(updateData)
      .returning('*');

    return row ? this.mapToUser(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    // RGPD compliant: anonymize user data instead of hard delete
    const result = await this.db(this.TABLE_NAME)
      .where({ id })
      .update({
        email: `deleted_${id}@anonymized.collector.shop`,
        username: `deleted_user_${id.substring(0, 8)}`,
        password_hash: '',
        first_name: null,
        last_name: null,
        avatar_url: null,
        status: UserStatus.BANNED,
        updated_at: new Date(),
      });

    return result > 0;
  }

  async emailExists(email: string): Promise<boolean> {
    const result = await this.db(this.TABLE_NAME)
      .whereRaw('LOWER(email) = ?', [email.toLowerCase()])
      .count('id as count')
      .first();
    return Number(result?.count) > 0;
  }

  async usernameExists(username: string): Promise<boolean> {
    const result = await this.db(this.TABLE_NAME)
      .whereRaw('LOWER(username) = ?', [username.toLowerCase()])
      .count('id as count')
      .first();
    return Number(result?.count) > 0;
  }

  // Map database row to User entity
  private mapToUser(row: Record<string, unknown>): User {
    return {
      id: row.id as string,
      email: row.email as string,
      username: row.username as string,
      passwordHash: row.password_hash as string,
      role: row.role as UserRole,
      status: row.status as UserStatus,
      firstName: row.first_name as string | undefined,
      lastName: row.last_name as string | undefined,
      avatarUrl: row.avatar_url as string | undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at as string) : undefined,
    };
  }
}
