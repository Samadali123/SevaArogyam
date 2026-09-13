"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const index_1 = require("./routes/index.js");
const errorHandler_1 = require("./middlewares/errorHandler.js");
const environment_1 = require("./config/environment.js");
const constants_1 = require("./utilities/constants.js");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
/**
 * @class Server
 * @description Encapsulates Express app initialization, middleware setup,
 * route registration, and the HTTP server lifecycle.
 *
 *
 */
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    // ─────────────────────────────────────────────
    // Middleware Setup
    // ─────────────────────────────────────────────
    /**
     * @description Registers core Express middlewares.
     *
     */
    setupMiddlewares() {
        // Parse JSON request bodies (50mb limit for base64 image uploads)
        this.app.use(express_1.default.json({ limit: '50mb' }));
        // Parse URL-encoded form data
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
        // Serve local uploads and public images statically
        this.app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
        this.app.use('/images', express_1.default.static(path_1.default.join(__dirname, 'public', 'images')));
        this.app.use('/images', express_1.default.static(path_1.default.join(process.cwd(), 'src', 'public', 'images')));
        this.app.use('/public', express_1.default.static(path_1.default.join(__dirname, 'public')));
        this.app.use('/public', express_1.default.static(path_1.default.join(process.cwd(), 'src', 'public')));
        // ── Future middlewares (will be wired here as they are built) ──────
        // CORS Configuration: Supports local dev, Vercel frontend, and environment CORS_ORIGIN list
        const configuredOrigins = (environment_1.env.CORS_ORIGIN || '*')
            .split(',')
            .map((o) => o.trim().replace(/\/$/, ''))
            .filter(Boolean);
        this.app.use((0, cors_1.default)({
            origin: (requestOrigin, callback) => {
                if (!requestOrigin)
                    return callback(null, true);
                const cleanOrigin = requestOrigin.replace(/\/$/, '');
                const defaultAllowed = ['https://seva-arogyam.vercel.app', 'http://localhost:5173', 'http://localhost:3000'];
                if (configuredOrigins.includes('*') ||
                    configuredOrigins.includes(cleanOrigin) ||
                    defaultAllowed.includes(cleanOrigin) ||
                    cleanOrigin.endsWith('.vercel.app') ||
                    cleanOrigin.includes('localhost') ||
                    cleanOrigin.includes('127.0.0.1')) {
                    return callback(null, true);
                }
                return callback(null, true);
            },
            credentials: true
        }));
        this.app.use((0, morgan_1.default)(environment_1.env.LOG_LEVEL));
        // this.app.use(sanitizeRequest());
    }
    // ─────────────────────────────────────────────
    // Route Setup
    // ─────────────────────────────────────────────
    /**
     * @description Registers all versioned API routes and the 404 catch-all.
     */
    setupRoutes() {
        (0, index_1.setupRoutes)(this.app);
    }
    // ─────────────────────────────────────────────
    // Error Handling
    // ─────────────────────────────────────────────
    /**
     * @description Registers the global error handler.
     *              MUST be the very LAST middleware registered.
     */
    setupErrorHandling() {
        this.app.use(errorHandler_1.globalErrorHandler);
    }
    // ─────────────────────────────────────────────
    // Server Lifecycle
    // ─────────────────────────────────────────────
    /**
     * @method start
     * @description Starts the HTTP server and listens on the configured port.
     *              Registers SIGTERM / SIGINT handlers for graceful shutdown.
     */
    start() {
        const port = environment_1.env.PORT || constants_1.SERVER.DEFAULT_PORT;
        const httpServer = this.app.listen(port, () => {
            console.info(` server started running on port ${port}`);
        });
        // ── Graceful Shutdown ────────────────────────────────────────────────
        const shutdown = (signal) => {
            console.info(`[SERVER] ${signal} received. Shutting down gracefully...`);
            httpServer.close(() => {
                console.info('[SERVER] HTTP server closed.');
                process.exit(0);
            });
            // Force shutdown if graceful close takes too long
            setTimeout(() => {
                console.error('[SERVER] Forced shutdown after timeout.');
                process.exit(1);
            }, constants_1.SERVER.GRACEFUL_SHUTDOWN_TIMEOUT_MS);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        // ── Uncaught Exception / Rejection Handlers ──────────────────────────
        process.on('uncaughtException', (err) => {
            console.error('[FATAL] Uncaught Exception:', err);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason) => {
            console.error('[FATAL] Unhandled Promise Rejection:', reason);
            process.exit(1);
        });
    }
    /**
     * @method getApp
     * @description Exposes the raw Express app for testing purposes.
     */
    getApp() {
        return this.app;
    }
}
exports.Server = Server;
//# sourceMappingURL=Server.js.map