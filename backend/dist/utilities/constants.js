"use strict";
/**
 * @file constants.ts
 * @description SINGLE SOURCE OF TRUTH for all application constants.
 *              If you need to change any config value, change it HERE.
 *              Never hardcode values in controllers or routes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT = exports.USER_ROLES = exports.ENVIRONMENTS = exports.MESSAGES = exports.SERVER = exports.HTTP_STATUS = exports.API = void 0;
// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
exports.API = {
    VERSION: 'v1',
    BASE_PATH: '/api/v1',
    PREFIX: '/api',
};
// ─────────────────────────────────────────────
// HTTP STATUS CODES
// ─────────────────────────────────────────────
exports.HTTP_STATUS = {
    // 2xx — Success
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    // 4xx — Client Errors
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    // 5xx — Server Errors
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
};
// ─────────────────────────────────────────────
// SERVER CONFIG
// ─────────────────────────────────────────────
exports.SERVER = {
    DEFAULT_PORT: 5000,
    GRACEFUL_SHUTDOWN_TIMEOUT_MS: 10000,
};
// ─────────────────────────────────────────────
// RESPONSE MESSAGES (Templates)
// ─────────────────────────────────────────────
exports.MESSAGES = {
    // Generic
    SUCCESS: 'Operation successful',
    NOT_FOUND: 'Resource not found',
    INTERNAL_ERROR: 'Internal server error',
    // Health
    SERVER_HEALTHY: 'Server is running',
};
// ─────────────────────────────────────────────
// ENVIRONMENTS
// ─────────────────────────────────────────────
exports.ENVIRONMENTS = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test',
};
// ─────────────────────────────────────────────
// USER ROLES
// ─────────────────────────────────────────────
exports.USER_ROLES = {
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    PATIENT: 'PATIENT',
    STAFF: 'STAFF',
};
// ─────────────────────────────────────────────
// JWT CONFIGURATION
// ─────────────────────────────────────────────
exports.JWT = {
    ACCESS_EXPIRES_IN: '1h',
    REFRESH_EXPIRES_IN: '7d',
    OTP_EXPIRES_MINS: 10,
};
//# sourceMappingURL=constants.js.map