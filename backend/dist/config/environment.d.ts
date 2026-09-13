/**
 * @function validateEnv
 * @description Validates that all required environment variables are set.
 *              Call this once at startup (before creating the Express app).
 * @throws Will throw an error listing every missing variable.
 */
export declare const validateEnv: () => void;
/**
 * @description Type-safe environment configuration object.
 *              Import this wherever you need env values instead of accessing
 *              `process.env` directly.
 *
 * @example
 *   import { env } from './environment.js';
 *   const port = env.PORT;
 */
export declare const env: {
    readonly NODE_ENV: string;
    readonly PORT: number;
    readonly DATABASE_URL: string;
    readonly JWT_SECRET: string;
    readonly JWT_EXPIRATION: string;
    readonly CORS_ORIGIN: string;
    readonly LOG_LEVEL: string;
    readonly isProduction: boolean;
    readonly isDevelopment: boolean;
    readonly isTest: boolean;
};
//# sourceMappingURL=environment.d.ts.map