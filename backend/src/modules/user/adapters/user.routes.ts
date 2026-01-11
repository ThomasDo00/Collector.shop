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

  /**
   * GET /api/users/profile/:username
   * Get user profile by username
   */
  fastify.get<{ Params: { username: string } }>('/profile/:username', async (request, reply) => {
    const { username } = request.params;

    const user = await db('users')
      .select(
        'id',
        'username',
        'email',
        'first_name as firstName',
        'last_name as lastName',
        'avatar_url as avatarUrl',
        'bio',
        'location',
        'created_at as memberSince',
        'role',
        'status'
      )
      .where('username', username)
      .first();

    if (!user) {
      return reply.status(404).send({ error: 'USER_NOT_FOUND', message: 'User not found' });
    }

    // Get user statistics
    const [salesCountResult, reviewsResult] = await Promise.all([
      db('products')
        .where('seller_id', user.id)
        .andWhere('status', 'sold')
        .count('* as count')
        .first(),
      db('reviews')
        .where('seller_id', user.id)
        .select(
          db.raw('COUNT(*) as count'),
          db.raw('AVG(rating) as average_rating')
        )
        .first(),
    ]);

    const salesCount = Number(salesCountResult?.count || 0);
    const reviewCount = Number(reviewsResult?.count || 0);
    const rating = Number(reviewsResult?.average_rating || 0);

    return {
      success: true,
      data: {
        ...user,
        salesCount,
        reviewCount,
        rating: rating ? parseFloat(rating.toFixed(1)) : 0,
        responseRate: 98, // Mock for now
        responseTime: '< 1 heure', // Mock for now
        isVerified: user.status === 'active',
      },
    };
  });

  /**
   * GET /api/users/profile/:username/listings
   * Get user's products/listings
   */
  fastify.get<{ Params: { username: string }; Querystring: { status?: string } }>(
    '/profile/:username/listings',
    async (request, reply) => {
      const { username } = request.params;
      const { status } = request.query;

      // Get user ID
      const user = await db('users')
        .select('id')
        .where('username', username)
        .first();

      if (!user) {
        return reply.status(404).send({ error: 'USER_NOT_FOUND' });
      }

      let query = db('products')
        .select(
          'products.id',
          'products.title',
          'products.price',
          'products.image_url as imageUrl',
          'products.category_name as category',
          'products.condition',
          'products.status',
          'products.created_at as createdAt',
          'users.id as seller.id',
          'users.username as seller.username'
        )
        .leftJoin('users', 'products.seller_id', 'users.id')
        .where('products.seller_id', user.id);

      if (status) {
        query = query.where('products.status', status);
      }

      const products = await query.orderBy('products.created_at', 'desc');

      // Transform nested seller object
      const formattedProducts = products.map((p: Record<string, unknown>) => ({
        id: p.id,
        title: p.title,
        price: parseFloat(p.price as string),
        imageUrl: p.imageUrl,
        category: p.category,
        condition: p.condition,
        status: p.status,
        createdAt: p.createdAt,
        seller: {
          id: p['seller.id'],
          username: p['seller.username'],
        },
      }));

      return { success: true, data: formattedProducts };
    }
  );

  /**
   * GET /api/users/profile/:username/reviews
   * Get user's reviews
   */
  fastify.get<{ Params: { username: string } }>(
    '/profile/:username/reviews',
    async (request, reply) => {
      const { username } = request.params;

      // Get user ID
      const user = await db('users')
        .select('id')
        .where('username', username)
        .first();

      if (!user) {
        return reply.status(404).send({ error: 'USER_NOT_FOUND' });
      }

      const reviews = await db('reviews')
        .select(
          'reviews.id',
          'reviews.rating',
          'reviews.comment',
          'reviews.created_at as createdAt',
          'buyer.username as author.username',
          'buyer.avatar_url as author.avatarUrl'
        )
        .leftJoin('users as buyer', 'reviews.buyer_id', 'buyer.id')
        .where('reviews.seller_id', user.id)
        .orderBy('reviews.created_at', 'desc');

      // Transform nested author object
      const formattedReviews = reviews.map((r: Record<string, unknown>) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        author: {
          username: r['author.username'],
          avatarUrl: r['author.avatarUrl'],
        },
      }));

      return { success: true, data: formattedReviews };
    }
  );
}
