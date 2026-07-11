import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Express middleware factory that validates `req.body` against a Zod schema.
 * On success, replaces `req.body` with the parsed (sanitized) data.
 * On failure, passes the ZodError to the centralized error handler.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(result.error); // Caught by errorHandler (ZodError branch)
    }
    req.body = result.data;
    next();
  };
}

/**
 * Express middleware factory that validates `req.query` against a Zod schema.
 * On success, replaces `req.query` with the parsed (sanitized) data.
 * On failure, passes the ZodError to the centralized error handler.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(result.error); // Caught by errorHandler (ZodError branch)
    }
    req.query = result.data as any;
    next();
  };
}

