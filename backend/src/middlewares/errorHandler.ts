import { Request, Response, NextFunction } from 'express';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS } from '@utilities/constants';
import { env } from '@config/environment';

// ─────────────────────────────────────────────
// Helper: build the error JSON body
// ─────────────────────────────────────────────

const buildErrorResponse = (
  message: string,
  code: string,
) => ({
  success: false as const,
  error: {
    message,
    code,
    timestamp: new Date().toISOString(),
  },
});

// ─────────────────────────────────────────────
// Development error response (full stack trace)
// ─────────────────────────────────────────────

const sendDevError = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    ...buildErrorResponse(err.message, err.code),
  });
};

// ─────────────────────────────────────────────
// Production error response (no internals leaked)
// ─────────────────────────────────────────────

const sendProdError = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    // Known/expected errors — send details to client
    res.status(err.statusCode).json(buildErrorResponse(err.message, err.code));
  } else {
    // Unknown/programmer errors — log internally, send generic response
    console.error('[ERROR] Unexpected error:', err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(buildErrorResponse('Something went wrong. Please try again.', ERROR_CODES.INTERNAL_SERVER_ERROR));
  }
};

// ─────────────────────────────────────────────
// Global Error Handler Middleware
// ─────────────────────────────────────────────

/**
 * @middleware globalErrorHandler
 * @description MUST be the LAST middleware registered in Express.
 *              Catches all errors forwarded via `next(error)` or thrown
 *              inside `asyncHandler` wrappers and returns a standardized
 *              JSON error response.
 */
export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // Convert known third-party errors to AppError instances
  let appErr = err as AppError;

  if (!appErr.isOperational) {
    // Truly unknown error — wrap with 500
    appErr = new AppError(
      err.message || 'Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      false, // not operational
    );
  }

  if (env.isDevelopment) {
    sendDevError(appErr, res);
  } else {
    sendProdError(appErr, res);
  }
};
