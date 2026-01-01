import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";

import { db } from "@/config/database";
import { users } from "@/models";
import { UserRole } from "@/types/model";
import {
  UnauthorizedError,
  ForbiddenError,
  ExternalServiceError,
} from "@/utils/errors";
import { verifyJwt } from "@/utils/jwt";

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
    // SECURITY: Read token from httpOnly cookie
    // This prevents XSS attacks from stealing the token via Authorization header
    const token = req.cookies.accessToken;

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    // Verify token with Supabase Auth
    const authUser = await verifyJwt(token);

    const user = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
      columns: { id: true, email: true, role: true, accountStatus: true },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (user.accountStatus === "BANNED") {
      throw new ForbiddenError(
        "Your account has been banned. Please contact support."
      );
    }

    if (user.accountStatus === "PENDING_VERIFICATION") {
      throw new ForbiddenError(
        "Your account is pending verification. Please verify your email."
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.accountStatus === "ACTIVE",
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

/**
 * Check if seller is currently active (not expired)
 */
export const checkActiveSeller = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (req.user.role !== "SELLER") {
      return next(
        new ForbiddenError("You must be a seller to access this resource")
      );
    }

    // Check seller expiration date
    const seller = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
      columns: { sellerExpireDate: true },
    });

    if (!seller) {
      return next(new UnauthorizedError("Seller not found"));
    }

    // If seller has expiration date and it has passed
    if (
      seller.sellerExpireDate &&
      new Date(seller.sellerExpireDate) < new Date()
    ) {
      return next(
        new ForbiddenError(
          "Your seller account has expired. Please renew to continue selling."
        )
      );
    }

    next();
  } catch (error) {
    next(
      new ExternalServiceError("Failed to verify seller status", error as Error)
    );
  }
};
