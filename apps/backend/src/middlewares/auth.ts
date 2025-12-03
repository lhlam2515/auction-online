import { Request, Response, NextFunction } from "express";

import { UserRole } from "@/types/model";
import { UnauthorizedError, ForbiddenError } from "@/utils/errors";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
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

    // TODO: Verify JWT token and decode user info
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;

    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired token"));
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
  if (!req.user?.isActive) {
    return next(new ForbiddenError("Your account has been deactivated"));
  }
  next();
};
