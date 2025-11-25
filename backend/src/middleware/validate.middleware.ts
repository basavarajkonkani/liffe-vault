import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation source types
 */
type ValidationSource = 'body' | 'params' | 'query';

/**
 * Middleware factory to validate request data using Zod schemas
 * @param schema - Zod schema to validate against
 * @param source - Source of data to validate (body, params, or query)
 * @returns Express middleware function
 */
export const validate = (schema: ZodSchema, source: ValidationSource = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Get the data from the specified source
      const dataToValidate = req[source];

      // Validate the data against the schema
      const validatedData = schema.parse(dataToValidate);

      // Replace the original data with validated data
      // For query params, we need to use Object.assign since query is read-only
      if (source === 'query') {
        Object.assign(req.query, validatedData);
      } else {
        req[source] = validatedData;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a user-friendly structure
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: formattedErrors,
        });
        return;
      }

      // Handle unexpected errors
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during validation',
      });
    }
  };
};

/**
 * Convenience function for validating request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Convenience function for validating request params
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');

/**
 * Convenience function for validating request query
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
