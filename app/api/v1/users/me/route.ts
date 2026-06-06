import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { excludePassword } from "@/lib/auth";
import {
  requireAuth,
  errorResponse,
  successResponse,
  validateEmail,
} from "@/lib/api-utils";

// GET /api/v1/users/me - Get current user
export async function GET(request: NextRequest) {
  try {
    const result = await requireAuth(request);
    if ("error" in result) {
      return result.error;
    }

    return successResponse(excludePassword(result.user));
  } catch (error) {
    console.error("Get current user error:", error);
    return errorResponse(500, "Internal server error");
  }
}

// PATCH /api/v1/users/me - Update current user
export async function PATCH(request: NextRequest) {
  try {
    const result = await requireAuth(request);
    if ("error" in result) {
      return result.error;
    }

    const body = await request.json();
    const { email, full_name } = body;

    const updateData: { email?: string; fullName?: string } = {};

    if (email !== undefined) {
      if (!validateEmail(email)) {
        return errorResponse(400, "Invalid email format");
      }

      // Check if email is already taken by another user
      if (email !== result.user.email) {
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

    const updatedUser = await prisma.user.update({
      where: { id: result.user.id },
      data: updateData,
    });

    return successResponse(excludePassword(updatedUser));
  } catch (error) {
    console.error("Update current user error:", error);
    return errorResponse(500, "Internal server error");
  }
}

// DELETE /api/v1/users/me - Delete current user
export async function DELETE(request: NextRequest) {
  try {
    const result = await requireAuth(request);
    if ("error" in result) {
      return result.error;
    }

    // Superusers cannot delete themselves
    if (result.user.isSuperuser) {
      return errorResponse(
        403,
        "Super users are not allowed to delete themselves",
      );
    }

    await prisma.user.delete({
      where: { id: result.user.id },
    });

    return successResponse({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete current user error:", error);
    return errorResponse(500, "Internal server error");
  }
}
