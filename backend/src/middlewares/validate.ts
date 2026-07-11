import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export type ValidationTarget = 'body' | 'query' | 'params';

function validateRequestData(schema: ZodSchema, target: ValidationTarget, req: Request) {
  const data = req[target];
  const result = schema.safeParse(data);
  if (!result.success) {
    return result.error;
  }

  req[target] = result.data as never;
  return null;
}

/**
 * Express middleware factory that validates a request target (body/query/params) against a Zod schema.
 * On success, replaces the target data with the parsed (sanitized) data.
 * On failure, passes the ZodError to the centralized error handler.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const error = validateRequestData(schema, target, req);
    if (error) {
      return next(error);
    }
    next();
  };
}

/**
 * Express middleware factory that validates `req.query` against a Zod schema.
 * On success, replaces `req.query` with the parsed (sanitized) data.
 * On failure, passes the ZodError to the centralized error handler.
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query');
}

/**
 * Express middleware factory that validates `req.params` against a Zod schema.
 * On success, replaces `req.params` with the parsed (sanitized) data.
 * On failure, passes the ZodError to the centralized error handler.
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params');
}

