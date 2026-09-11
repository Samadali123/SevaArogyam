import { Router } from 'express';
import { healthCheck } from '@controllers/v1/health.controller';

/**
 * @router healthRouter
 * @base   /api/v1/health
 *
 * @description Defines the public health check endpoint.
 *              No authentication middleware is applied here intentionally —
 *              load balancers and uptime monitors must be able to reach
 *              this route without a token.
 */
const healthRouter = Router();


healthRouter.get('/', healthCheck);

export default healthRouter;
