import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '@core/database/index.js';
import { PostgresUserRepository } from '../infrastructure/PostgresUserRepository.js';
import { RegisterUser, EmailAlreadyExistsError, UsernameAlreadyExistsError } from '../domain/usecases/RegisterUser.js';
import { createUserDTOSchema, userResponseSchema } from '../domain/entities/User.js';

// Request body schema
const registerBodySchema = createUserDTOSchema;

type RegisterBody = z.infer<typeof registerBodySchema>;

export async function userRoutes(fastify: FastifyInstance) {
  const db = getDatabase();
  const userRepository = new PostgresUserRepository(db);
  const registerUser = new RegisterUser(userRepository);

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
   * GET /api/users/health
   * Health check endpoint for the user module
   */
  fastify.get('/health', async () => {
    return { status: 'ok', module: 'users' };
  });
}
