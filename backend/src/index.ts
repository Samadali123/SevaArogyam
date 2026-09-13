/**
 * @file index.ts
 * @description Application entry point.
 *
 *              Responsibilities:
 *              1. Validate environment variables (fail fast if missing)
 *              2. Instantiate the Server
 *              3. Start listening for HTTP requests
 *
 *        
 */

import { validateEnv } from '@config/environment';
import { Server } from './Server';

// ── Step 1: Validate ENV before anything else ─────────────────────────────
validateEnv();

// ── Step 2: Bootstrap the server ─────────────────────────────────────────
const server = new Server();
server.start();
