"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.isLoggedIn = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../errors/AppError.js");
const errorCodes_1 = require("../errors/errorCodes.js");
const constants_1 = require("../utilities/constants.js");
const database_1 = require("../config/database.js");
const environment_1 = require("../config/environment.js");
const asyncHandler_1 = require("../utilities/asyncHandler.js");
/**
 * Middleware to verify that the incoming request has a valid JWT Access Token.
 * If valid, it fetches the user and attaches it to `req.user`.
 */
exports.isLoggedIn = (0, asyncHandler_1.asyncHandler)(async (req, _res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        throw new AppError_1.AppError('You are not logged in. Please provide a valid token.', constants_1.HTTP_STATUS.UNAUTHORIZED, errorCodes_1.ERROR_CODES.UNAUTHORIZED, true);
    }
    try {
        // 1) Verify token
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.env.JWT_SECRET);
        // 2) Check if user still exists
        const currentUser = await database_1.prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!currentUser || !currentUser.isActive) {
            throw new AppError_1.AppError('The user belonging to this token does no longer exist or is inactive.', constants_1.HTTP_STATUS.UNAUTHORIZED, errorCodes_1.ERROR_CODES.UNAUTHORIZED, true);
        }
        // 3) Grant access to protected route by assigning user to req
        req.user = currentUser;
        next();
    }
    catch (err) {
        throw new AppError_1.AppError('Invalid or expired token. Please log in again.', constants_1.HTTP_STATUS.UNAUTHORIZED, errorCodes_1.ERROR_CODES.UNAUTHORIZED, true);
    }
});
/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER `isLoggedIn`.
 * @param roles Array of allowed roles
 */
const restrictTo = (...roles) => {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError_1.AppError('You do not have permission to perform this action', constants_1.HTTP_STATUS.FORBIDDEN, errorCodes_1.ERROR_CODES.FORBIDDEN, true);
        }
        next();
    };
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=auth.js.map