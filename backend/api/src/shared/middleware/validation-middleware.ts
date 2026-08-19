import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../error';

/**
 * Middleware to validate request body against a Zod schema
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result; // Replace body with parsed/validated data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new BadRequestError(`Validation failed: ${JSON.stringify(errorMessages)}`));
      } else {
        next(new BadRequestError('Invalid request body'));
      }
    }
  };
}

/**
 * Middleware to validate request query parameters against a Zod schema
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query);
      req.query = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new BadRequestError(`Query validation failed: ${JSON.stringify(errorMessages)}`));
      } else {
        next(new BadRequestError('Invalid query parameters'));
      }
    }
  };
}

/**
 * Middleware to validate request parameters against a Zod schema
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.params);
      req.params = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new BadRequestError(`Params validation failed: ${JSON.stringify(errorMessages)}`));
      } else {
        next(new BadRequestError('Invalid path parameters'));
      }
    }
  };
}
