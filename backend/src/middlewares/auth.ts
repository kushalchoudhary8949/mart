import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import * as userRepo from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';
import { Role } from '@prisma/client';

// ─── requireAuth ─────────────────────────────────────────────────────────────

/**
 * Verifies the JWT access token from the Authorization header.
 * Loads the user from the database and attaches to `req.user`.
 * Rejects with 401 if token is missing, invalid, expired, or user is inactive.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required.', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Access token is required.', HTTP_STATUS.UNAUTHORIZED);
    }

    // 2. Verify token
    const decoded = verifyAccessToken(token);

    // 3. Check user exists and is active
    const user = await userRepo.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.UNAUTHORIZED);
    }
    if (!user.isActive) {
      throw new AppError(
        'Your account has been deactivated. Contact support.',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // 4. Attach user payload to request
    req.user = {
      id: user.id,
      phone: user.phone,
      role: user.role as any,
      isAdmin: user.role === Role.ADMIN,
    };

    next();
  } catch (error: any) {
    // Handle JWT-specific errors
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token.', HTTP_STATUS.UNAUTHORIZED));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired.', HTTP_STATUS.UNAUTHORIZED));
    }
    next(error);
  }
}

// ─── requireRole ─────────────────────────────────────────────────────────────

/**
 * Middleware factory that restricts access to specific user roles.
 * Must be used AFTER requireAuth.
 *
 * @example router.get('/admin/dashboard', requireAuth, requireRole(['ADMIN']), handler)
 */
export function requireRole(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', HTTP_STATUS.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action.',
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
}
