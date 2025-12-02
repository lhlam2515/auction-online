import { type ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { toast } from "sonner";
import logger from "@/lib/logger";
import { getErrorDetails, showError } from "./error";

/**
 * Action handler result type
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Action handler options
 */
export interface ActionOptions {
  /** Success toast message */
  successMessage?: string;
  /** Action name for logging */
  actionName?: string;
}

/**
 * Convert FormData to plain object
 */
function formDataToObject(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  return data;
}

/**
 * Convert field errors array to single string per field
 */
function simplifyFieldErrors(
  fieldErrors?: Record<string, string[]>
): Record<string, string> | undefined {
  if (!fieldErrors) return undefined;

  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, messages]) => [key, messages[0]])
  );
}

/**
 * Create action handler with validation
 *
 * @example
 * ```ts
 * export const action = createAction(loginSchema, async (data) => {
 *   const user = await authService.login(data);
 *   return redirect("/dashboard");
 * });
 * ```
 */
export function createAction<TSchema extends z.ZodTypeAny, TOutput = unknown>(
  schema: TSchema,
  handler: (
    data: z.infer<TSchema>,
    args: ActionFunctionArgs
  ) => Promise<TOutput>,
  options?: ActionOptions
) {
  return async (args: ActionFunctionArgs): Promise<ActionResult<TOutput>> => {
    try {
      // Parse and validate
      const formData = await args.request.formData();
      const rawData = formDataToObject(formData);
      const result = schema.safeParse(rawData);

      if (!result.success) {
        // Use error handler for consistent validation error handling
        const details = getErrorDetails(result.error);
        showError(result.error);

        if (import.meta.env.DEV && options?.actionName) {
          logger.warn(`[${options.actionName}] Validation failed`, {
            fieldErrors: details.fieldErrors,
          });
        }

        return {
          success: false,
          error: details.message,
          fieldErrors: simplifyFieldErrors(details.fieldErrors),
        };
      }

      // Execute handler
      const data = await handler(result.data, args);

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      if (import.meta.env.DEV && options?.actionName) {
        logger.info(`[${options.actionName}] Success`);
      }

      return { success: true, data };
    } catch (error) {
      // Use error handler for consistent error handling
      const details = getErrorDetails(error);
      showError(error);

      if (import.meta.env.DEV && options?.actionName) {
        logger.error(`[${options.actionName}] Failed`, error);
      }

      return {
        success: false,
        error: details.message,
        fieldErrors: simplifyFieldErrors(details.fieldErrors),
      };
    }
  };
}

/**
 * Create simple action without validation
 *
 * @example
 * ```ts
 * export const action = createSimpleAction(async () => {
 *   await authService.logout();
 *   return redirect("/login");
 * }, { successMessage: "Đã đăng xuất" });
 * ```
 */
export function createSimpleAction<TOutput = unknown>(
  handler: (args: ActionFunctionArgs) => Promise<TOutput>,
  options?: ActionOptions
) {
  return async (args: ActionFunctionArgs): Promise<ActionResult<TOutput>> => {
    try {
      const data = await handler(args);

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      if (import.meta.env.DEV && options?.actionName) {
        logger.info(`[${options.actionName}] Success`);
      }

      return { success: true, data };
    } catch (error) {
      // Use error handler for consistent error handling
      const details = getErrorDetails(error);
      showError(error);

      if (import.meta.env.DEV && options?.actionName) {
        logger.error(`[${options.actionName}] Failed`, error);
      }

      return {
        success: false,
        error: details.message,
        fieldErrors: simplifyFieldErrors(details.fieldErrors),
      };
    }
  };
}
