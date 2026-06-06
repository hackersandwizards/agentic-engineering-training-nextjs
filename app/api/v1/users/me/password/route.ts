import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import {
  withAuth,
  errorResponse,
  successResponse,
  parseBody,
} from "@/lib/api-utils";
import { validatePassword } from "@/lib/validation";
import { passwordChangeSchema } from "@/lib/schemas";

export const PATCH = withAuth(
  async (request: NextRequest, user) => {
    const parsed = await parseBody(request, passwordChangeSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const { current_password, new_password } = parsed.data;

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
