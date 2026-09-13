import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../utilities/constants.js';
/**
 * Middleware to verify that the incoming request has a valid JWT Access Token.
 * If valid, it fetches the user and attaches it to `req.user`.
 */
export declare const isLoggedIn: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER `isLoggedIn`.
 * @param roles Array of allowed roles
 */
export declare const restrictTo: (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map