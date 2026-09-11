/**
 * @file constants.ts
 * @description SINGLE SOURCE OF TRUTH for all application constants.
 *              If you need to change any config value, change it HERE.
 *              Never hardcode values in controllers or routes.
 */

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
export const API = {
  VERSION: 'v1',
  BASE_PATH: '/api/v1',
  PREFIX: '/api',
} as const;

// ─────────────────────────────────────────────
// HTTP STATUS CODES
// ─────────────────────────────────────────────
export const HTTP_STATUS = {
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
} as const;

// ─────────────────────────────────────────────
// SERVER CONFIG
// ─────────────────────────────────────────────
export const SERVER = {
  DEFAULT_PORT: 5000,
  GRACEFUL_SHUTDOWN_TIMEOUT_MS: 10_000,
} as const;

// ─────────────────────────────────────────────
// RESPONSE MESSAGES (Templates)
// ─────────────────────────────────────────────
export const MESSAGES = {
  // Generic
  SUCCESS: 'Operation successful',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',

  // Health
  SERVER_HEALTHY: 'Server is running',
} as const;

// ─────────────────────────────────────────────
// ENVIRONMENTS
// ─────────────────────────────────────────────
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

// ─────────────────────────────────────────────
// USER ROLES
// ─────────────────────────────────────────────
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  STAFF: 'STAFF',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ─────────────────────────────────────────────
// JWT CONFIGURATION
// ─────────────────────────────────────────────
export const JWT = {
  ACCESS_EXPIRES_IN: '1h',
  REFRESH_EXPIRES_IN: '7d',
  OTP_EXPIRES_MINS: 10,
} as const;
