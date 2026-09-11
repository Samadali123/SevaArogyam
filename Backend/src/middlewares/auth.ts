import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS, UserRole } from '@utilities/constants';
import { prisma } from '@config/database';
import { env } from '@config/environment';
import { asyncHandler } from '@utilities/asyncHandler';

interface JwtPayload {
  id: string;
  role: UserRole;
}

/**
 * Middleware to verify that the incoming request has a valid JWT Access Token.
 * If valid, it fetches the user and attaches it to `req.user`.
 */
export const isLoggedIn = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError(
      'You are not logged in. Please provide a valid token.',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED,
      true
    );
  }

  try {
    // 1) Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // 2) Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser || !currentUser.isActive) {
      throw new AppError(
        'The user belonging to this token does no longer exist or is inactive.',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED,
        true
      );
    }

    // 3) Grant access to protected route by assigning user to req
    req.user = currentUser;
    next();
  } catch (err) {
    throw new AppError(
      'Invalid or expired token. Please log in again.',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED,
      true
    );
  }
});

/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER `isLoggedIn`.
 * @param roles Array of allowed roles
 */
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      throw new AppError(
        'You do not have permission to perform this action',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN,
        true
      );
    }
    next();
  };
};
