import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';

/**
 * Application error structure
 */
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Error codes mapping
 */
export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  USERNAME_EXISTS: 'USERNAME_EXISTS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',

  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const;

/**
 * User-friendly error messages in French
 */
const errorMessages: Record<string, string> = {
  [ErrorCodes.NETWORK_ERROR]: 'Erreur de connexion. Veuillez verifier votre connexion internet.',
  [ErrorCodes.TIMEOUT]: 'La requete a expire. Veuillez reessayer.',
  [ErrorCodes.UNAUTHORIZED]: 'Veuillez vous connecter pour continuer.',
  [ErrorCodes.FORBIDDEN]: "Vous n'avez pas la permission d'effectuer cette action.",
  [ErrorCodes.INVALID_CREDENTIALS]: 'Email/nom d\'utilisateur ou mot de passe incorrect.',
  [ErrorCodes.EMAIL_EXISTS]: 'Cette adresse email est deja utilisee.',
  [ErrorCodes.USERNAME_EXISTS]: 'Ce nom d\'utilisateur est deja pris.',
  [ErrorCodes.EMAIL_NOT_VERIFIED]: 'Veuillez verifier votre adresse email.',
  [ErrorCodes.ACCOUNT_SUSPENDED]: 'Votre compte a ete suspendu.',
  [ErrorCodes.ACCOUNT_BANNED]: 'Votre compte a ete banni.',
  [ErrorCodes.VALIDATION_ERROR]: 'Les donnees fournies sont invalides.',
  [ErrorCodes.BAD_REQUEST]: 'Requete invalide. Veuillez verifier vos donnees.',
  [ErrorCodes.NOT_FOUND]: 'La ressource demandee n\'existe pas.',
  [ErrorCodes.CONFLICT]: 'Un conflit est survenu. Veuillez reessayer.',
  [ErrorCodes.RATE_LIMITED]: 'Trop de requetes. Veuillez patienter un moment.',
  [ErrorCodes.SERVER_ERROR]: 'Une erreur est survenue. Veuillez reessayer plus tard.',
  [ErrorCodes.UNKNOWN]: 'Une erreur inattendue est survenue.',
};

/**
 * Handle API errors and return a standardized AppError
 */
export function handleApiError(error: unknown): AppError {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiErrorResponse | undefined;

    // If we have a structured API error response
    if (apiError && apiError.error) {
      const code = apiError.error;
      return {
        code,
        message: errorMessages[code] || apiError.message || errorMessages[ErrorCodes.UNKNOWN],
        details: apiError.details,
      };
    }

    // Network errors (no response)
    if (error.code === 'ECONNABORTED') {
      return {
        code: ErrorCodes.TIMEOUT,
        message: errorMessages[ErrorCodes.TIMEOUT],
      };
    }

    if (!error.response) {
      return {
        code: ErrorCodes.NETWORK_ERROR,
        message: errorMessages[ErrorCodes.NETWORK_ERROR],
      };
    }

    // HTTP status-based errors
    switch (error.response.status) {
      case 400:
        return {
          code: ErrorCodes.BAD_REQUEST,
          message: errorMessages[ErrorCodes.BAD_REQUEST],
        };
      case 401:
        return {
          code: ErrorCodes.UNAUTHORIZED,
          message: errorMessages[ErrorCodes.UNAUTHORIZED],
        };
      case 403:
        return {
          code: ErrorCodes.FORBIDDEN,
          message: errorMessages[ErrorCodes.FORBIDDEN],
        };
      case 404:
        return {
          code: ErrorCodes.NOT_FOUND,
          message: errorMessages[ErrorCodes.NOT_FOUND],
        };
      case 409:
        return {
          code: ErrorCodes.CONFLICT,
          message: errorMessages[ErrorCodes.CONFLICT],
        };
      case 429:
        return {
          code: ErrorCodes.RATE_LIMITED,
          message: errorMessages[ErrorCodes.RATE_LIMITED],
        };
      case 500:
      default:
        return {
          code: ErrorCodes.SERVER_ERROR,
          message: errorMessages[ErrorCodes.SERVER_ERROR],
        };
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      code: ErrorCodes.UNKNOWN,
      message: error.message || errorMessages[ErrorCodes.UNKNOWN],
    };
  }

  return {
    code: ErrorCodes.UNKNOWN,
    message: errorMessages[ErrorCodes.UNKNOWN],
  };
}

/**
 * Check if error is a specific type
 */
export function isErrorCode(error: AppError, code: keyof typeof ErrorCodes): boolean {
  return error.code === ErrorCodes[code];
}

/**
 * Get validation errors for a specific field
 */
export function getFieldError(error: AppError, field: string): string | undefined {
  return error.details?.[field]?.[0];
}
