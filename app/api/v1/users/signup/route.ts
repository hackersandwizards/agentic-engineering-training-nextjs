import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, excludePassword } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  validateEmail,
  validatePassword,
} from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

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

    // Check if user already exists
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
    console.error("Signup error:", error);
    return errorResponse(500, "Internal server error");
  }
}
