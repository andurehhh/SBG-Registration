// backend/src/middleware/validate.ts
import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const errors = zodError.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
      return;
    }

    // Replace req.body with the parsed (and coerced) data
    req.body = result.data;
    next();
  };
}
