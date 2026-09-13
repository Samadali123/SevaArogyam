import { Request, Response } from 'express';
import { asyncHandler } from '@utilities/asyncHandler';
import { HTTP_STATUS, MESSAGES } from '@utilities/constants';
import { env } from '@config/environment';
import { ApiSuccessResponse, HealthCheckData } from '@apitypes/responses';

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
export const healthCheck = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const response: ApiSuccessResponse<HealthCheckData> = {
      success: true,
      message: MESSAGES.SERVER_HEALTHY,
      data: {
        environment: env.NODE_ENV,
        version: '1.0.0',
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.OK).json(response);
  },
);
