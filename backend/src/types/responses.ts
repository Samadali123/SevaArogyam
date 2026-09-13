/**
 * @file responses.ts
 * @description TypeScript interfaces for the standardized API response shapes.
 *              Every controller must conform to one of these shapes so that
 *              clients always receive a predictable JSON structure.
 */

// ─────────────────────────────────────────────
// Success Response
// ─────────────────────────────────────────────

/**
 * Shape for all successful responses.
 *
 * @example
 *   res.status(200).json({
 *     success: true,
 *     message: 'User retrieved',
 *     data: { user },
 *     timestamp: new Date().toISOString(),
 *   } satisfies ApiSuccessResponse<{ user: IUser }>);
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

// ─────────────────────────────────────────────
// Error Response
// ─────────────────────────────────────────────

/**
 * Shape for all error responses.
 *
 * @example
 *   res.status(404).json({
 *     success: false,
 *     error: {
 *       message: 'User not found',
 *       code: 'USER_NOT_FOUND',
 *       timestamp: new Date().toISOString(),
 *     },
 *   } satisfies ApiErrorResponse);
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    timestamp: string;
  };
}

// ─────────────────────────────────────────────
// Paginated Success Response
// ─────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiPaginatedResponse<T = unknown> extends ApiSuccessResponse<T> {
  pagination: PaginationMeta;
}

// ─────────────────────────────────────────────
// Health Check Response
// ─────────────────────────────────────────────

export interface HealthCheckData {
  environment: string;
  version: string;
}
