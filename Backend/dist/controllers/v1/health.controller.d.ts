/**
 * @controller healthCheck
 * @route   GET /api/v1/health
 * @access  Public — no authentication required
 *
 * @description Returns the current health status of the server.
 *              Useful for load balancers, uptime monitors, and CI pipelines
 *              to verify the service is up and responding.
 *
 * @returns {ApiSuccessResponse<HealthCheckData>} 200 with server info
 */
export declare const healthCheck: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=health.controller.d.ts.map