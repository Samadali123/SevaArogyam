/**
 * @file constants.ts
 * @description SINGLE SOURCE OF TRUTH for all application constants.
 *              If you need to change any config value, change it HERE.
 *              Never hardcode values in controllers or routes.
 */
export declare const API: {
    readonly VERSION: "v1";
    readonly BASE_PATH: "/api/v1";
    readonly PREFIX: "/api";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly METHOD_NOT_ALLOWED: 405;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly NOT_IMPLEMENTED: 501;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const SERVER: {
    readonly DEFAULT_PORT: 5000;
    readonly GRACEFUL_SHUTDOWN_TIMEOUT_MS: 10000;
};
export declare const MESSAGES: {
    readonly SUCCESS: "Operation successful";
    readonly NOT_FOUND: "Resource not found";
    readonly INTERNAL_ERROR: "Internal server error";
    readonly SERVER_HEALTHY: "Server is running";
};
export declare const ENVIRONMENTS: {
    readonly DEVELOPMENT: "development";
    readonly PRODUCTION: "production";
    readonly TEST: "test";
};
export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];
export declare const USER_ROLES: {
    readonly ADMIN: "ADMIN";
    readonly DOCTOR: "DOCTOR";
    readonly PATIENT: "PATIENT";
    readonly STAFF: "STAFF";
};
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export declare const JWT: {
    readonly ACCESS_EXPIRES_IN: "1h";
    readonly REFRESH_EXPIRES_IN: "7d";
    readonly OTP_EXPIRES_MINS: 10;
};
//# sourceMappingURL=constants.d.ts.map