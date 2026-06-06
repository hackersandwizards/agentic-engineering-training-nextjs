import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import {
  requireAuth,
  errorResponse,
  successResponse,
  validatePassword,
} from "@/lib/api-utils";

// PATCH /api/v1/users/me/password - Change password
export async function PATCH(request: NextRequest) {
  try {
    const result = await requireAuth(request);
    if ("error" in result) {
      return result.error;
    }

    const body = await request.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return errorResponse(
        400,
        "Current password and new password are required",
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      current_password,
      result.user.hashedPassword,
    );
    if (!isCurrentPasswordValid) {
      return errorResponse(400, "Incorrect password");
    }

    // Validate new password
    const passwordError = validatePassword(new_password);
    if (passwordError) {
      return errorResponse(400, passwordError);
    }

    // Check that new password is different
    if (current_password === new_password) {
      return errorResponse(
        400,
        "New password cannot be the same as the current one",
      );
    }

    const hashedNewPassword = await hashPassword(new_password);

    await prisma.user.update({
      where: { id: result.user.id },
      data: { hashedPassword: hashedNewPassword },
    });

    return successResponse({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse(500, "Internal server error");
  }
}
