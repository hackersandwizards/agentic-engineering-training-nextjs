import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { excludePassword } from "@/lib/auth";
import {
  withAuth,
  errorResponse,
  successResponse,
  parseBody,
  isUniqueConstraintError,
} from "@/lib/api-utils";
import { userUpdateMeSchema } from "@/lib/schemas";

export const GET = withAuth(
  async (request: NextRequest, user) => {
    return successResponse(excludePassword(user));
  },
  { errorLabel: "Get current user error:" },
);

export const PATCH = withAuth(
  async (request: NextRequest, user) => {
    const parsed = await parseBody(request, userUpdateMeSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const { email, full_name } = parsed.data;

    const updateData: { email?: string; fullName?: string } = {};

    if (email !== undefined) {
      if (email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });
        if (existingUser) {
          return errorResponse(400, "Email already registered");
        }
      }
      updateData.email = email;
    }

    if (full_name !== undefined) {
      updateData.fullName = full_name;
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
      return successResponse(excludePassword(updatedUser));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return errorResponse(409, "Email already registered");
      }
      throw error;
    }
  },
  { errorLabel: "Update current user error:" },
);

export const DELETE = withAuth(
  async (request: NextRequest, user) => {
    if (user.isSuperuser) {
      return errorResponse(
        403,
        "Super users are not allowed to delete themselves",
      );
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    return successResponse({ message: "User deleted successfully" });
  },
  { errorLabel: "Delete current user error:" },
);
