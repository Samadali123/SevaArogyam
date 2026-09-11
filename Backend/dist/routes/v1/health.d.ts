/**
 * @router healthRouter
 * @base   /api/v1/health
 *
 * @description Defines the public health check endpoint.
 *              No authentication middleware is applied here intentionally —
 *              load balancers and uptime monitors must be able to reach
 *              this route without a token.
 */
declare const healthRouter: import("express-serve-static-core").Router;
export default healthRouter;
//# sourceMappingURL=health.d.ts.map