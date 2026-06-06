import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, excludePassword } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  parseBody,
  isUniqueConstraintError,
} from "@/lib/api-utils";
import { signupSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseBody(request, signupSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const { email, password, full_name } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(400, "The user with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        fullName: full_name || null,
        isActive: true,
        isSuperuser: false,
      },
    });

    return successResponse(excludePassword(user), 201);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return errorResponse(409, "The user with this email already exists");
    }
    console.error("Signup error:", error);
    return errorResponse(500, "Internal server error");
  }
}
