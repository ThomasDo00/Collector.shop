import bcrypt from 'bcrypt';
import { CreateUserDTO, createUserDTOSchema, User } from '../entities/User.js';
import { IUserRepository } from '../ports/IUserRepository.js';

/**
 * Register User Use Case
 * Following Single Responsibility Principle (SRP)
 * This class only handles user registration logic
 */
export class RegisterUser {
  private readonly BCRYPT_COST = 12;

  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: CreateUserDTO): Promise<User> {
    // Validate input data
    const validatedData = createUserDTOSchema.parse(data);

    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(validatedData.email);
    if (emailExists) {
      throw new EmailAlreadyExistsError(validatedData.email);
    }

    // Check if username already exists
    const usernameExists = await this.userRepository.usernameExists(validatedData.username);
    if (usernameExists) {
      throw new UsernameAlreadyExistsError(validatedData.username);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, this.BCRYPT_COST);

    // Create user
    const user = await this.userRepository.create({
      email: validatedData.email,
      username: validatedData.username,
      passwordHash,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
    });

    return user;
  }
}

// Domain errors
export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Email "${email}" is already registered`);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class UsernameAlreadyExistsError extends Error {
  constructor(username: string) {
    super(`Username "${username}" is already taken`);
    this.name = 'UsernameAlreadyExistsError';
  }
}
