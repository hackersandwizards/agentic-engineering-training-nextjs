import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import {
  withAuth,
  errorResponse,
  successResponse,
  validatePassword,
  parseJsonBody,
} from "@/lib/api-utils";

export const PATCH = withAuth(
  async (request: NextRequest, user) => {
    const parsed = await parseJsonBody<{
      current_password?: string;
      new_password?: string;
    }>(request);
    if ("error" in parsed) {
      return parsed.error;
    }
    const { current_password, new_password } = parsed.data;

    if (!current_password || !new_password) {
      return errorResponse(
        400,
        "Current password and new password are required",
      );
    }

    const isCurrentPasswordValid = await verifyPassword(
      current_password,
      user.hashedPassword,
    );
    if (!isCurrentPasswordValid) {
      return errorResponse(400, "Incorrect password");
    }

    const passwordError = validatePassword(new_password);
    if (passwordError) {
      return errorResponse(400, passwordError);
    }

    if (current_password === new_password) {
      return errorResponse(
        400,
        "New password cannot be the same as the current one",
      );
    }

    const hashedNewPassword = await hashPassword(new_password);

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword: hashedNewPassword },
    });

    return successResponse({ message: "Password updated successfully" });
  },
  { errorLabel: "Change password error:" },
);
