"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const asyncHandler_1 = require("../../utilities/asyncHandler.js");
const constants_1 = require("../../utilities/constants.js");
const environment_1 = require("../../config/environment.js");
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
exports.healthCheck = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const response = {
        success: true,
        message: constants_1.MESSAGES.SERVER_HEALTHY,
        data: {
            environment: environment_1.env.NODE_ENV,
            version: '1.0.0',
        },
        timestamp: new Date().toISOString(),
    };
    res.status(constants_1.HTTP_STATUS.OK).json(response);
});
//# sourceMappingURL=health.controller.js.map