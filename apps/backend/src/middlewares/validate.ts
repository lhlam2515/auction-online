import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import { BadRequestError } from "@/utils/errors";

/**
 * Validate request data against Zod schema
 */
export const validate = (schema: {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as any;
      }

      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as any;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        );
        return next(new BadRequestError(messages.join(", ")));
      }
      next(error);
    }
  };
};
