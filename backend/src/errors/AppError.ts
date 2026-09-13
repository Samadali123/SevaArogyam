import { ErrorCode, ERROR_CODES } from '@errors/errorCodes';

/**
 * @class AppError
 * @extends Error
 * @description Custom operational error class for the application.
 *
 *              Whenever you want to return an error response, throw this
 *              instead of a raw Error. The globalErrorHandler middleware
 *              checks `isOperational` to distinguish expected errors from
 *              unexpected crashes.
 *
 * @example
 *   throw new AppError('User not found', 404);
 *   throw new AppError('Invalid credentials', 401, ERROR_CODES.INVALID_CREDENTIALS);
 */
export class AppError extends Error {
  /** HTTP status code to send in the response */
  public readonly statusCode: number;

  /** Machine-readable error code for clients */
  public readonly code: ErrorCode;

  /**
   * `true` for known/expected errors (e.g., "not found", "unauthorized").
   * `false` for unexpected programmer errors — the server will log those
   * separately and return a generic 500.
   */
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    isOperational = true,
  ) {
    super(message);

    // Restore the prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Capture the stack trace, excluding the constructor frame
    Error.captureStackTrace(this, this.constructor);
  }
}
