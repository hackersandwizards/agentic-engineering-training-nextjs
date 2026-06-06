import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, excludePassword } from "@/lib/auth";
import {
  requireAuth,
  requireSuperuser,
  errorResponse,
  successResponse,
  validateEmail,
  validatePassword,
} from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

// GET /api/v1/users/[userId] - Get user by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const result = await requireAuth(request);
    if ("error" in result) {
      return result.error;
    }

    // Users can only get their own info unless they're superuser
    if (result.user.id !== userId && !result.user.isSuperuser) {
      return errorResponse(403, "The user doesn't have enough privileges");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse(404, "User not found");
    }

    return successResponse(excludePassword(user));
  } catch (error) {
    console.error("Get user error:", error);
    return errorResponse(500, "Internal server error");
  }
}

// PATCH /api/v1/users/[userId] - Update user by ID (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const result = await requireSuperuser(request);
    if ("error" in result) {
      return result.error;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse(404, "User not found");
    }

    const body = await request.json();
    const { email, password, full_name, is_superuser, is_active } = body;

    const updateData: {
      email?: string;
      hashedPassword?: string;
      fullName?: string;
      isSuperuser?: boolean;
      isActive?: boolean;
    } = {};

    if (email !== undefined) {
      if (!validateEmail(email)) {
        return errorResponse(400, "Invalid email format");
      }
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

    if (password !== undefined) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        return errorResponse(400, passwordError);
      }
      updateData.hashedPassword = await hashPassword(password);
    }

    if (full_name !== undefined) {
      updateData.fullName = full_name;
    }

    if (is_superuser !== undefined) {
      updateData.isSuperuser = is_superuser;
    }

    if (is_active !== undefined) {
      updateData.isActive = is_active;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return successResponse(excludePassword(updatedUser));
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse(500, "Internal server error");
  }
}

// DELETE /api/v1/users/[userId] - Delete user by ID (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const result = await requireSuperuser(request);
    if ("error" in result) {
      return result.error;
    }

    // Cannot delete yourself
    if (result.user.id === userId) {
      return errorResponse(
        403,
        "Super users are not allowed to delete themselves",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse(404, "User not found");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return successResponse({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return errorResponse(500, "Internal server error");
  }
}
