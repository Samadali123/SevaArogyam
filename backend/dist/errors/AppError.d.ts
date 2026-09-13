import { ErrorCode } from './errorCodes.js';
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
export declare class AppError extends Error {
    /** HTTP status code to send in the response */
    readonly statusCode: number;
    /** Machine-readable error code for clients */
    readonly code: ErrorCode;
    /**
     * `true` for known/expected errors (e.g., "not found", "unauthorized").
     * `false` for unexpected programmer errors — the server will log those
     * separately and return a generic 500.
     */
    readonly isOperational: boolean;
    constructor(message: string, statusCode: number, code?: ErrorCode, isOperational?: boolean);
}
//# sourceMappingURL=AppError.d.ts.map