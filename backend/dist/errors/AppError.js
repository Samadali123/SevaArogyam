"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const errorCodes_1 = require("@errors/errorCodes");
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
class AppError extends Error {
    constructor(message, statusCode, code = errorCodes_1.ERROR_CODES.INTERNAL_SERVER_ERROR, isOperational = true) {
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
exports.AppError = AppError;
//# sourceMappingURL=AppError.js.map