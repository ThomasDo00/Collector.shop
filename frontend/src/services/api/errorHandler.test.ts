import { describe, it, expect } from 'vitest';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { handleApiError, isErrorCode, getFieldError, ErrorCodes } from './errorHandler';
import type { ApiErrorResponse } from '@/types';

describe('errorHandler', () => {
  describe('handleApiError', () => {
    it('handles structured API error response', () => {
      const apiError: ApiErrorResponse = {
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'Email already exists',
      };

      const axiosError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        {} as InternalAxiosRequestConfig,
        {},
        {
          data: apiError,
          status: 409,
          statusText: 'Conflict',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        }
      );

      const result = handleApiError(axiosError);

      expect(result.code).toBe('EMAIL_EXISTS');
      expect(result.message).toBe('Cette adresse email est deja utilisee.');
    });

    it('handles API error with details', () => {
      const apiError: ApiErrorResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          email: ['Invalid email format'],
          password: ['Too short'],
        },
      };

      const axiosError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        {} as InternalAxiosRequestConfig,
        {},
        {
          data: apiError,
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        }
      );

      const result = handleApiError(axiosError);

      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.details).toEqual({
        email: ['Invalid email format'],
        password: ['Too short'],
      });
    });

    it('handles timeout error', () => {
      const axiosError = new AxiosError('Timeout', 'ECONNABORTED');

      const result = handleApiError(axiosError);

      expect(result.code).toBe(ErrorCodes.TIMEOUT);
      expect(result.message).toBe('La requete a expire. Veuillez reessayer.');
    });

    it('handles network error (no response)', () => {
      const axiosError = new AxiosError('Network Error', 'ERR_NETWORK');

      const result = handleApiError(axiosError);

      expect(result.code).toBe(ErrorCodes.NETWORK_ERROR);
      expect(result.message).toBe(
        'Erreur de connexion. Veuillez verifier votre connexion internet.'
      );
    });

    it('handles 400 Bad Request', () => {
      const axiosError = new AxiosError(
        'Bad Request',
        'ERR_BAD_REQUEST',
        {} as InternalAxiosRequestConfig,
        {},
        {
          status: 400,
          data: {},
          statusText: 'Bad Request',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        }
      );

      const result = handleApiError(axiosError);

      expect(result.code).toBe(ErrorCodes.BAD_REQUEST);
    });

    it('handles 401 Unauthorized', () => {
      const axiosError = new AxiosError(
        'Unauthorized',
        'ERR_BAD_REQUEST',
        {} as InternalAxiosRequestConfig,
        {},
        {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        }
      );

      const result = handleApiError(axiosError);

      expect(result.code).toBe(ErrorCodes.UNAUTHORIZED);
    });

    it('handles 403 Forbidden', () => {
      const axiosError = new AxiosError(
        'Forbidden',
        'ERR_BAD_REQUEST',
        {} as InternalAxiosRequestConfig,
        {},
        {
          status: 403,
          data: {},
          statusText: 'Forbidden',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        }
      );

      const result = handleApiError(axiosError);

      expect(result.code).toBe(ErrorCodes.FORBIDDEN);
    });

    it('handles 404 Not Found', () => {
      const axiosError = new AxiosError(
        'Not Found',
        'ERR_BAD_REQUEST',
        {} as InternalAxiosRequestConfig,
        {},
        {
          status: 404,
          data: {},
          statusText: 'Not Found',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        }
      );

      const result = handleApiError(axiosError);

      expect(result.code).toBe(ErrorCodes.NOT_FOUND);
    });

    it('handles 409 Conflict', () => {
      const axiosError = new AxiosError(
        'Conflict',
        'ERR_BAD_REQUEST',
        {} as InternalAxiosRequestConfig,
        {},
        {
          status: 409,
          data: {},
          statusText: 'Conflict',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        }
      );

      const result = handleApiError(axiosError);

      expect(result.code).toBe(ErrorCodes.CONFLICT);
    });

    it('handles 429 Rate Limited', () => {
      const axiosError = new AxiosError(
        'Too Many Requests',
        'ERR_BAD_REQUEST',
        {} as InternalAxiosRequestConfig,
        {},
        {
          status: 429,
          data: {},
          statusText: 'Too Many Requests',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        }
      );

      const result = handleApiError(axiosError);

      expect(result.code).toBe(ErrorCodes.RATE_LIMITED);
    });

    it('handles 500 Server Error', () => {
      const axiosError = new AxiosError(
        'Internal Server Error',
        'ERR_BAD_REQUEST',
        {} as InternalAxiosRequestConfig,
        {},
        {
          status: 500,
          data: {},
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        }
      );

      const result = handleApiError(axiosError);

      expect(result.code).toBe(ErrorCodes.SERVER_ERROR);
    });

    it('handles generic Error', () => {
      const error = new Error('Generic error');
      const result = handleApiError(error);

      expect(result.code).toBe(ErrorCodes.UNKNOWN);
      expect(result.message).toBe('Generic error');
    });

    it('handles unknown error type', () => {
      const result = handleApiError('string error');

      expect(result.code).toBe(ErrorCodes.UNKNOWN);
    });
  });

  describe('isErrorCode', () => {
    it('returns true when error code matches', () => {
      const error = { code: ErrorCodes.EMAIL_EXISTS, message: 'Test' };
      expect(isErrorCode(error, 'EMAIL_EXISTS')).toBe(true);
    });

    it('returns false when error code does not match', () => {
      const error = { code: ErrorCodes.EMAIL_EXISTS, message: 'Test' };
      expect(isErrorCode(error, 'NETWORK_ERROR')).toBe(false);
    });
  });

  describe('getFieldError', () => {
    it('returns first error for field', () => {
      const error = {
        code: 'VALIDATION_ERROR',
        message: 'Test',
        details: {
          email: ['Invalid format', 'Already exists'],
        },
      };

      expect(getFieldError(error, 'email')).toBe('Invalid format');
    });

    it('returns undefined when field has no errors', () => {
      const error = {
        code: 'VALIDATION_ERROR',
        message: 'Test',
        details: {
          email: ['Invalid format'],
        },
      };

      expect(getFieldError(error, 'password')).toBeUndefined();
    });

    it('returns undefined when no details', () => {
      const error = {
        code: 'VALIDATION_ERROR',
        message: 'Test',
      };

      expect(getFieldError(error, 'email')).toBeUndefined();
    });
  });

  describe('handleApiError - Additional Coverage', () => {
    it('handles generic Error instance', () => {
      const genericError = new Error('Generic error message');
      const result = handleApiError(genericError);

      expect(result.code).toBe(ErrorCodes.UNKNOWN);
      expect(result.message).toBe('Generic error message');
    });

    it('handles Error without message', () => {
      const errorWithoutMessage = new Error('Unknown error');
      errorWithoutMessage.message = '';
      const result = handleApiError(errorWithoutMessage);

      expect(result.code).toBe(ErrorCodes.UNKNOWN);
      expect(result.message).toBeTruthy();
    });

    it('handles unknown error type', () => {
      const unknownError = { something: 'unexpected' };
      const result = handleApiError(unknownError);

      expect(result.code).toBe(ErrorCodes.UNKNOWN);
      expect(result.message).toBeTruthy();
    });
  });
});
