import { Application } from 'express';
/**
 * @class Server
 * @description Encapsulates Express app initialization, middleware setup,
 * route registration, and the HTTP server lifecycle.
 *
 *
 */
export declare class Server {
    private readonly app;
    constructor();
    /**
     * @description Registers core Express middlewares.
     *
     */
    private setupMiddlewares;
    /**
     * @description Registers all versioned API routes and the 404 catch-all.
     */
    private setupRoutes;
    /**
     * @description Registers the global error handler.
     *              MUST be the very LAST middleware registered.
     */
    private setupErrorHandling;
    /**
     * @method start
     * @description Starts the HTTP server and listens on the configured port.
     *              Registers SIGTERM / SIGINT handlers for graceful shutdown.
     */
    start(): void;
    /**
     * @method getApp
     * @description Exposes the raw Express app for testing purposes.
     */
    getApp(): Application;
}
//# sourceMappingURL=Server.d.ts.map