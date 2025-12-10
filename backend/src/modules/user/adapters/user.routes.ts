import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '@core/database/index.js';
import { PostgresUserRepository } from '../infrastructure/PostgresUserRepository.js';
import { RegisterUser, EmailAlreadyExistsError, UsernameAlreadyExistsError } from '../domain/usecases/RegisterUser.js';
import {
  LoginUser,
  InvalidCredentialsError,
  EmailNotVerifiedError,
  AccountSuspendedError,
  AccountBannedError,
  loginCredentialsSchema
} from '../domain/usecases/LoginUser.js';
import { createUserDTOSchema, userResponseSchema } from '../domain/entities/User.js';
import { env } from '@core/config/env.js';

// Request body schemas
const registerBodySchema = createUserDTOSchema;
const loginBodySchema = loginCredentialsSchema;

type RegisterBody = z.infer<typeof registerBodySchema>;
type LoginBody = z.infer<typeof loginBodySchema>;

export async function userRoutes(fastify: FastifyInstance) {
  const db = getDatabase();
  const userRepository = new PostgresUserRepository(db);
  const registerUser = new RegisterUser(userRepository);
  const loginUser = new LoginUser(userRepository);

  /**
   * POST /api/users/register
   * Register a new user
   */
  fastify.post<{ Body: RegisterBody }>(
    '/register',
    {
      schema: {
        description: 'Register a new user account',
        tags: ['Users'],
        body: {
          type: 'object',
          required: ['email', 'username', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            username: { type: 'string', minLength: 3, maxLength: 30 },
            password: { type: 'string', minLength: 8 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        response: {
          201: {
            description: 'User successfully registered',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
      try {
        const user = await registerUser.execute(request.body);
        const userResponse = userResponseSchema.parse(user);

        return reply.status(201).send({
          success: true,
          message: 'User registered successfully. Please check your email to verify your account.',
          data: {
            id: userResponse.id,
            email: userResponse.email,
            username: userResponse.username,
          },
        });
      } catch (error) {
        if (error instanceof EmailAlreadyExistsError) {
          return reply.status(409).send({
            success: false,
            error: 'EMAIL_EXISTS',
            message: error.message,
          });
        }

        if (error instanceof UsernameAlreadyExistsError) {
          return reply.status(409).send({
            success: false,
            error: 'USERNAME_EXISTS',
            message: error.message,
          });
        }

        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          });
        }

        throw error;
      }
    }
  );

  /**
   * POST /api/users/login
   * Authenticate user and return JWT tokens
   */
  fastify.post<{ Body: LoginBody }>(
    '/login',
    {
      schema: {
        description: 'Login with email/username and password',
        tags: ['Users'],
        body: {
          type: 'object',
          required: ['emailOrUsername', 'password'],
          properties: {
            emailOrUsername: { type: 'string', description: 'Email or username' },
            password: { type: 'string', description: 'User password' },
          },
        },
        response: {
          200: {
            description: 'Successfully authenticated',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  refreshToken: { type: 'string' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      username: { type: 'string' },
                      role: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      try {
        const loginResult = await loginUser.execute(request.body);

        // Generate JWT access token
        const accessToken = fastify.jwt.sign(
          {
            userId: loginResult.userId,
            email: loginResult.email,
            username: loginResult.username,
            role: loginResult.role,
          },
          {
            expiresIn: env.JWT_EXPIRES_IN,
          }
        );

        // Generate JWT refresh token
        const refreshToken = fastify.jwt.sign(
          {
            userId: loginResult.userId,
            type: 'refresh',
          },
          {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN,
          }
        );

        return reply.status(200).send({
          success: true,
          message: 'Login successful',
          data: {
            accessToken,
            refreshToken,
            user: {
              id: loginResult.userId,
              email: loginResult.email,
              username: loginResult.username,
              role: loginResult.role,
            },
          },
        });
      } catch (error) {
        if (error instanceof InvalidCredentialsError) {
          return reply.status(401).send({
            success: false,
            error: 'INVALID_CREDENTIALS',
            message: error.message,
          });
        }

        if (error instanceof EmailNotVerifiedError) {
          return reply.status(403).send({
            success: false,
            error: 'EMAIL_NOT_VERIFIED',
            message: error.message,
          });
        }

        if (error instanceof AccountSuspendedError) {
          return reply.status(403).send({
            success: false,
            error: 'ACCOUNT_SUSPENDED',
            message: error.message,
          });
        }

        if (error instanceof AccountBannedError) {
          return reply.status(403).send({
            success: false,
            error: 'ACCOUNT_BANNED',
            message: error.message,
          });
        }

        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          });
        }

        throw error;
      }
    }
  );

  /**
   * GET /api/users/health
   * Health check endpoint for the user module
   */
  fastify.get('/health', async () => {
    return { status: 'ok', module: 'users' };
  });
}
