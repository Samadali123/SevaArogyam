import { Application } from 'express';
import v1Router from './v1/index';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { API, HTTP_STATUS } from '@utilities/constants';

/**
 * @function setupRoutes
 * @description Mounts all versioned API routers onto the Express app.
 *              Also registers a 404 handler for any unmatched routes —
 *              this must come AFTER all route registrations.
 *
 * @param {Application} app - The Express application instance
 */
export const setupRoutes = (app: Application): void => {
  // ── API Versions ───────────────────────────────────────────────────────
  app.use(API.BASE_PATH, v1Router);

  // ── 404 Catch-all ─────────────────────────────────────────────────────
  // Any request that didn't match a route above will hit this handler.
  // Throwing AppError here passes control to the global error handler.
  app.use('*', (_req, _res, next) => {
    next(
      new AppError(
        `Route not found`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND,
      ),
    );
  });
};
