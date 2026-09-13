"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("@controllers/v1/health.controller");
/**
 * @router healthRouter
 * @base   /api/v1/health
 *
 * @description Defines the public health check endpoint.
 *              No authentication middleware is applied here intentionally —
 *              load balancers and uptime monitors must be able to reach
 *              this route without a token.
 */
const healthRouter = (0, express_1.Router)();
healthRouter.get('/', health_controller_1.healthCheck);
exports.default = healthRouter;
//# sourceMappingURL=health.js.map