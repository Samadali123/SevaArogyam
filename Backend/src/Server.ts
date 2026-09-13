import express, { Application } from 'express';
import { setupRoutes } from '@routes/index';
import { globalErrorHandler } from '@middlewares/errorHandler';
import { env } from '@config/environment';
import { SERVER } from '@utilities/constants';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';

/**
 * @class Server
 * @description Encapsulates Express app initialization, middleware setup,
 * route registration, and the HTTP server lifecycle.
 *
 *             
 */
export class Server {
  private readonly app: Application;

  constructor() {
    this.app = express();
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
  private setupMiddlewares(): void {
    // Parse JSON request bodies (50mb limit for base64 image uploads)
    this.app.use(express.json({ limit: '50mb' }));

    // Parse URL-encoded form data
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Serve local uploads and public images statically
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    this.app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
    this.app.use('/images', express.static(path.join(process.cwd(), 'src', 'public', 'images')));
    this.app.use('/public', express.static(path.join(__dirname, 'public')));
    this.app.use('/public', express.static(path.join(process.cwd(), 'src', 'public')));

    // ── Future middlewares (will be wired here as they are built) ──────
    // this.app.use(helmet());
    this.app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
    this.app.use(morgan(env.LOG_LEVEL));
    // this.app.use(sanitizeRequest());


  }

  // ─────────────────────────────────────────────
  // Route Setup
  // ─────────────────────────────────────────────

  /**
   * @description Registers all versioned API routes and the 404 catch-all.
   */
  private setupRoutes(): void {
    setupRoutes(this.app);
  }

  // ─────────────────────────────────────────────
  // Error Handling
  // ─────────────────────────────────────────────

  /**
   * @description Registers the global error handler.
   *              MUST be the very LAST middleware registered.
   */
  private setupErrorHandling(): void {
    this.app.use(globalErrorHandler);
  }

  // ─────────────────────────────────────────────
  // Server Lifecycle
  // ─────────────────────────────────────────────

  /**
   * @method start
   * @description Starts the HTTP server and listens on the configured port.
   *              Registers SIGTERM / SIGINT handlers for graceful shutdown.
   */
  public start(): void {
    const port = env.PORT || SERVER.DEFAULT_PORT;

    const httpServer = this.app.listen(port, () => {
     console.info(` server started running on port ${port}`);
    });

    // ── Graceful Shutdown ────────────────────────────────────────────────

    const shutdown = (signal: string): void => {
      console.info(`[SERVER] ${signal} received. Shutting down gracefully...`);
      
      httpServer.close(() => {
        console.info('[SERVER] HTTP server closed.');
        process.exit(0);
      });

      // Force shutdown if graceful close takes too long
      setTimeout(() => {
        console.error('[SERVER] Forced shutdown after timeout.');
        process.exit(1);
      }, SERVER.GRACEFUL_SHUTDOWN_TIMEOUT_MS);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ── Uncaught Exception / Rejection Handlers ──────────────────────────
    process.on('uncaughtException', (err: Error) => {
      console.error('[FATAL] Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      console.error('[FATAL] Unhandled Promise Rejection:', reason);
      process.exit(1);
    });
  }

  /**
   * @method getApp
   * @description Exposes the raw Express app for testing purposes.
   */
  public getApp(): Application {
    return this.app;
  }
}
