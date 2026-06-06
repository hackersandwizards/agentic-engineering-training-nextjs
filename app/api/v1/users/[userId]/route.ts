import { prisma } from "@/lib/db";
import { hashPassword, excludePassword } from "@/lib/auth";
import {
  withAuth,
  errorResponse,
  successResponse,
  parseBody,
  isUniqueConstraintError,
  assertOwnerOrSuperuser,
} from "@/lib/api-utils";
import { userUpdateSchema } from "@/lib/schemas";

type RouteContext = { params: Promise<{ userId: string }> };

export const GET = withAuth<RouteContext>(
  async (request, user, { params }) => {
    const { userId } = await params;

    const permissionError = assertOwnerOrSuperuser(
      userId,
      user,
      "The user doesn't have enough privileges",
    );
    if (permissionError) {
      return permissionError;
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!target) {
      return errorResponse(404, "User not found");
    }

    return successResponse(excludePassword(target));
  },
  { errorLabel: "Get user error:" },
);

export const PATCH = withAuth<RouteContext>(
  async (request, user, { params }) => {
    const { userId } = await params;

    const target = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!target) {
      return errorResponse(404, "User not found");
    }

    const parsed = await parseBody(request, userUpdateSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const { email, password, full_name, is_superuser, is_active } = parsed.data;

    if (userId === user.id) {
      if (is_superuser !== undefined && is_superuser !== true) {
        return errorResponse(
          403,
          "Super users cannot remove their own superuser status",
        );
      }
      if (is_active !== undefined && is_active !== true) {
        return errorResponse(
          403,
          "Super users cannot deactivate their own account",
        );
      }
    }

    const updateData: {
      email?: string;
      hashedPassword?: string;
      fullName?: string;
      isSuperuser?: boolean;
      isActive?: boolean;
    } = {};

    if (email !== undefined) {
      updateData.email = email;
    }

    if (password !== undefined) {
      updateData.hashedPassword = await hashPassword(password);
    }

    if (full_name !== undefined) {
      updateData.fullName = full_name;
    }

    if (is_superuser !== undefined) {
      updateData.isSuperuser = is_superuser === true;
    }

    if (is_active !== undefined) {
      updateData.isActive = is_active === true;
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      return successResponse(excludePassword(updatedUser));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return errorResponse(400, "Email already registered");
      }
      throw error;
    }
  },
  { superuser: true, errorLabel: "Update user error:" },
);

export const DELETE = withAuth<RouteContext>(
  async (request, user, { params }) => {
    const { userId } = await params;

    if (user.id === userId) {
      return errorResponse(
        403,
        "Super users are not allowed to delete themselves",
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!target) {
      return errorResponse(404, "User not found");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return successResponse({ message: "User deleted successfully" });
  },
  { superuser: true, errorLabel: "Delete user error:" },
);
