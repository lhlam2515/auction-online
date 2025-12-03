import { db } from "@/config/database";
import { users } from "@/models";
import { eq } from "drizzle-orm";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";
import { LoginResponse } from "@repo/shared-types";

export class AuthService {
  async register(
    email: string,
    password: string,
    fullName: string,
    address: string
  ) {
    // TODO: implement registration with hashing, duplicates check, email verification
    throw new BadRequestError("Not implemented");
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // TODO: implement login with password check, token generation
    throw new UnauthorizedError("Not implemented");
  }

  async logout(userId: string) {
    // TODO: revoke refresh token / session if applicable
    return true;
  }

  async refreshToken(token: string): Promise<LoginResponse> {
    // TODO: validate refresh token and issue new tokens
    throw new UnauthorizedError("Not implemented");
  }

  async forgotPassword(email: string) {
    // TODO: create reset token and send email
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!existing) throw new NotFoundError("Email not found");
    return true;
  }

  async resetPassword(token: string, newPassword: string) {
    // TODO: verify reset token and update password
    throw new BadRequestError("Not implemented");
  }

  async verifyEmail(token: string) {
    // TODO: verify email token
    throw new BadRequestError("Not implemented");
  }

  async googleLogin(googleToken: string): Promise<LoginResponse> {
    // TODO: verify google token, upsert user, issue tokens
    throw new UnauthorizedError("Not implemented");
  }
}

export const authService = new AuthService();
