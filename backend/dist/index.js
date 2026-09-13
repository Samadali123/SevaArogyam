"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./config/environment.js");
const Server_1 = require("./Server");
// ── Step 1: Validate ENV before anything else ─────────────────────────────
(0, environment_1.validateEnv)();
// ── Step 2: Bootstrap the server ─────────────────────────────────────────
const server = new Server_1.Server();
server.start();
//# sourceMappingURL=index.js.map