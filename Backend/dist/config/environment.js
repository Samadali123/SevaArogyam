"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.validateEnv = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("@utilities/constants");
// Load .env file before anything else reads process.env
dotenv_1.default.config();
/**
 * @description Required environment variables. If any of these are missing
 *              at startup the process will exit immediately — better to fail
 *              fast than to crash mid-request in production.
 */
const REQUIRED_VARS = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
];
/**
 * @function validateEnv
 * @description Validates that all required environment variables are set.
 *              Call this once at startup (before creating the Express app).
 * @throws Will throw an error listing every missing variable.
 */
const validateEnv = () => {
    const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`[ENV] Missing required environment variables: ${missing.join(', ')}\n` +
            `Ensure these are set in your .env file.`);
    }
    console.log('[ENV] All required environment variables are present ✓');
};
exports.validateEnv = validateEnv;
/**
 * @description Type-safe environment configuration object.
 *              Import this wherever you need env values instead of accessing
 *              `process.env` directly.
 *
 * @example
 *   import { env } from '@config/environment';
 *   const port = env.PORT;
 */
exports.env = {
    NODE_ENV: (process.env['NODE_ENV'] ?? constants_1.ENVIRONMENTS.DEVELOPMENT),
    PORT: parseInt(process.env['PORT'] ?? '5000', 10),
    DATABASE_URL: process.env['DATABASE_URL'] ?? '',
    JWT_SECRET: process.env['JWT_SECRET'] ?? '',
    JWT_EXPIRATION: process.env['JWT_EXPIRATION'] ?? '7d',
    CORS_ORIGIN: process.env['CORS_ORIGIN'] ?? '*',
    LOG_LEVEL: process.env['LOG_LEVEL'] ?? 'dev',
    isProduction: process.env['NODE_ENV'] === constants_1.ENVIRONMENTS.PRODUCTION,
    isDevelopment: process.env['NODE_ENV'] === constants_1.ENVIRONMENTS.DEVELOPMENT,
    isTest: process.env['NODE_ENV'] === constants_1.ENVIRONMENTS.TEST,
};
//# sourceMappingURL=environment.js.map