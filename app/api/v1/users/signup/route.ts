import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, excludePassword } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  validateEmail,
  validatePassword,
  parseJsonBody,
  isUniqueConstraintError,
} from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJsonBody<{
      email?: string;
      password?: string;
      full_name?: string;
    }>(request);
    if ("error" in parsed) {
      return parsed.error;
    }
    const { email, password, full_name } = parsed.data;

    if (!email || !password) {
      return errorResponse(400, "Email and password are required");
    }

    if (!validateEmail(email)) {
      return errorResponse(400, "Invalid email format");
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return errorResponse(400, passwordError);
    }

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
