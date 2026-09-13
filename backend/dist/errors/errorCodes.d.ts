/**
 * @file errorCodes.ts
 * @description Enumeration of all application-level error codes.
 */
export declare const ERROR_CODES: {
    readonly INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly BAD_REQUEST: "BAD_REQUEST";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
//# sourceMappingURL=errorCodes.d.ts.map