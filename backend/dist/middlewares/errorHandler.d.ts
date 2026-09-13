import { Request, Response, NextFunction } from 'express';
/**
 * @middleware globalErrorHandler
 * @description MUST be the LAST middleware registered in Express.
 *              Catches all errors forwarded via `next(error)` or thrown
 *              inside `asyncHandler` wrappers and returns a standardized
 *              JSON error response.
 */
export declare const globalErrorHandler: (err: Error, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map