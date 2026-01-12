/**
 * Standardized error responses to eliminate duplication
 */

import type { FastifyReply } from 'fastify';

interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

/**
 * Send a standardized 404 Not Found response
 */
export function sendNotFound(
  reply: FastifyReply,
  errorCode: string,
  message: string
): void {
  reply.status(404).send({
    success: false,
    error: errorCode,
    message,
  } as ErrorResponse);
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  userNotFound: (reply: FastifyReply) =>
    sendNotFound(reply, 'USER_NOT_FOUND', 'User not found'),

  productNotFound: (reply: FastifyReply) =>
    sendNotFound(reply, 'PRODUCT_NOT_FOUND', 'Product not found'),

  categoryNotFound: (reply: FastifyReply) =>
    sendNotFound(reply, 'CATEGORY_NOT_FOUND', 'Category not found'),
};
