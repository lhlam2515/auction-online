import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";

import { db } from "@/config/database";
import { supabase } from "@/config/supabase";
import { users } from "@/models";
import { UserRole } from "@/types/model";
import {
  UnauthorizedError,
  ForbiddenError,
  ExternalServiceError,
} from "@/utils/errors";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
  };
}

/**
 * Verify JWT token and attach user info to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser || !authUser.email) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
      columns: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!authUser.email_confirmed_at) {
      throw new ForbiddenError("Email not verified");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      isVerified: !!authUser.email_confirmed_at,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
    } else {
      next(
        new ExternalServiceError("Authentication service error", error as Error)
      );
    }
  }
};

/**
 * Check if user has required role
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError("You don't have permission to access this resource")
      );
    }

    next();
  };
};

/**
 * Check if user account is active
 */
export const checkActiveAccount = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isVerified) {
    return next(new ForbiddenError("Your account has been deactivated"));
  }
  next();
};
