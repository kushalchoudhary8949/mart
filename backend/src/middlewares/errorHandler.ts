import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../config/logger';
import { config } from '../config';

/**
 * Express centralized error handling middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode: number = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = err.message || 'Something went wrong';
  let errors: any = undefined;

  // Log error stack for debugging
  logger.error(`${req.method} ${req.originalUrl} - Error:`, err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const targets = (err.meta?.target as string[]) || [];
        message = `Duplicate field value: ${targets.join(', ')}. Please use another value.`;
        break;
      }
      case 'P2025': {
        // Record not found
        statusCode = HTTP_STATUS.NOT_FOUND;
        message = err.meta?.cause as string || 'Record not found';
        break;
      }
      default:
        message = `Database query error: ${err.message}`;
    }
  }

  // Build error response payload
  const errorResponse: {
    success: boolean;
    error: string;
    errors?: any;
    stack?: string;
  } = {
    success: false,
    error: message,
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  // Show stack trace only in development
  if (config.env === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}
