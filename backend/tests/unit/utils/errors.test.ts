import { describe, it, expect, vi } from 'vitest';
import { sendNotFound, ErrorResponses } from '../../../src/utils/errors';
import type { FastifyReply } from 'fastify';

describe('errors', () => {
  describe('sendNotFound', () => {
    it('should send a standardized 404 response', () => {
      const mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as unknown as FastifyReply;

      sendNotFound(mockReply, 'TEST_ERROR', 'Test error message');

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'TEST_ERROR',
        message: 'Test error message',
      });
    });
  });

  describe('ErrorResponses', () => {
    it('should send user not found error', () => {
      const mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as unknown as FastifyReply;

      ErrorResponses.userNotFound(mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    });

    it('should send product not found error', () => {
      const mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as unknown as FastifyReply;

      ErrorResponses.productNotFound(mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    });

    it('should send category not found error', () => {
      const mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as unknown as FastifyReply;

      ErrorResponses.categoryNotFound(mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'CATEGORY_NOT_FOUND',
        message: 'Category not found',
      });
    });
  });
});
