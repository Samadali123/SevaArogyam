import dotenv from 'dotenv';
import { ENVIRONMENTS } from '@utilities/constants';

// Load .env file before anything else reads process.env
dotenv.config();

/**
 * @description Required environment variables. If any of these are missing
 *              at startup the process will exit immediately — better to fail
 *              fast than to crash mid-request in production.
 */
const REQUIRED_VARS = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
] as const;

/**
 * @function validateEnv
 * @description Validates that all required environment variables are set.
 *              Call this once at startup (before creating the Express app).
 * @throws Will throw an error listing every missing variable.
 */
export const validateEnv = (): void => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `[ENV] Missing required environment variables: ${missing.join(', ')}\n` +
        `Ensure these are set in your .env file.`,
    );
  }

  console.log('[ENV] All required environment variables are present ✓');
};

/**
 * @description Type-safe environment configuration object.
 *              Import this wherever you need env values instead of accessing
 *              `process.env` directly.
 *
 * @example
 *   import { env } from '@config/environment';
 *   const port = env.PORT;
 */
export const env = {
  NODE_ENV: (process.env['NODE_ENV'] ?? ENVIRONMENTS.DEVELOPMENT) as string,
  PORT: parseInt(process.env['PORT'] ?? '5000', 10),
  DATABASE_URL: process.env['DATABASE_URL'] ?? '',
  JWT_SECRET: process.env['JWT_SECRET'] ?? '',
  JWT_EXPIRATION: process.env['JWT_EXPIRATION'] ?? '7d',
  CORS_ORIGIN: process.env['CORS_ORIGIN'] ?? '*',
  LOG_LEVEL: process.env['LOG_LEVEL'] ?? 'dev',
  isProduction: process.env['NODE_ENV'] === ENVIRONMENTS.PRODUCTION,
  isDevelopment: process.env['NODE_ENV'] === ENVIRONMENTS.DEVELOPMENT,
  isTest: process.env['NODE_ENV'] === ENVIRONMENTS.TEST,
} as const;
