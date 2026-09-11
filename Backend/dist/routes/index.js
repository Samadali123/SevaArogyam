"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const index_1 = __importDefault(require("./v1/index"));
const AppError_1 = require("@errors/AppError");
const errorCodes_1 = require("@errors/errorCodes");
const constants_1 = require("@utilities/constants");
/**
 * @function setupRoutes
 * @description Mounts all versioned API routers onto the Express app.
 *              Also registers a 404 handler for any unmatched routes —
 *              this must come AFTER all route registrations.
 *
 * @param {Application} app - The Express application instance
 */
const setupRoutes = (app) => {
    // ── API Versions ───────────────────────────────────────────────────────
    app.use(constants_1.API.BASE_PATH, index_1.default);
    // ── 404 Catch-all ─────────────────────────────────────────────────────
    // Any request that didn't match a route above will hit this handler.
    // Throwing AppError here passes control to the global error handler.
    app.use('*', (_req, _res, next) => {
        next(new AppError_1.AppError(`Route not found`, constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND));
    });
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map