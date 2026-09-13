"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const AppError_1 = require("@errors/AppError");
const errorCodes_1 = require("@errors/errorCodes");
const constants_1 = require("@utilities/constants");
const environment_1 = require("@config/environment");
// ─────────────────────────────────────────────
// Helper: build the error JSON body
// ─────────────────────────────────────────────
const buildErrorResponse = (message, code) => ({
    success: false,
    error: {
        message,
        code,
        timestamp: new Date().toISOString(),
    },
});
// ─────────────────────────────────────────────
// Development error response (full stack trace)
// ─────────────────────────────────────────────
const sendDevError = (err, res) => {
    res.status(err.statusCode).json({
        ...buildErrorResponse(err.message, err.code),
    });
};
// ─────────────────────────────────────────────
// Production error response (no internals leaked)
// ─────────────────────────────────────────────
const sendProdError = (err, res) => {
    if (err.isOperational) {
        // Known/expected errors — send details to client
        res.status(err.statusCode).json(buildErrorResponse(err.message, err.code));
    }
    else {
        // Unknown/programmer errors — log internally, send generic response
        console.error('[ERROR] Unexpected error:', err);
        res
            .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json(buildErrorResponse('Something went wrong. Please try again.', errorCodes_1.ERROR_CODES.INTERNAL_SERVER_ERROR));
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
const globalErrorHandler = (err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    // Convert known third-party errors to AppError instances
    let appErr = err;
    if (!appErr.isOperational) {
        // Truly unknown error — wrap with 500
        appErr = new AppError_1.AppError(err.message || 'Internal server error', constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCodes_1.ERROR_CODES.INTERNAL_SERVER_ERROR, false);
    }
    if (environment_1.env.isDevelopment) {
        sendDevError(appErr, res);
    }
    else {
        sendProdError(appErr, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=errorHandler.js.map