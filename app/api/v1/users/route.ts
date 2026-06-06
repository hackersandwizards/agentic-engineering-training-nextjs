import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, excludePassword } from "@/lib/auth";
import {
  requireSuperuser,
  errorResponse,
  successResponse,
  parseQueryParams,
  validateEmail,
  validatePassword,
  parseJsonBody,
} from "@/lib/api-utils";

// GET /api/v1/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const result = await requireSuperuser(request);
    if ("error" in result) {
      return result.error;
    }

    const { skip, limit } = parseQueryParams(request);

    const [users, count] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return successResponse({
      data: users.map(excludePassword),
      count,
    });
  } catch (error) {
    console.error("List users error:", error);
    return errorResponse(500, "Internal server error");
  }
}

// POST /api/v1/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const result = await requireSuperuser(request);
    if ("error" in result) {
      return result.error;
    }

    const parsed = await parseJsonBody<{
      email?: string;
      password?: string;
      full_name?: string;
      is_superuser?: boolean;
    }>(request);
    if ("error" in parsed) {
      return parsed.error;
    }
    const { email, password, full_name, is_superuser } = parsed.data;

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
        isSuperuser: is_superuser === true,
      },
    });

    return successResponse(excludePassword(user), 201);
  } catch (error) {
    console.error("Create user error:", error);
    return errorResponse(500, "Internal server error");
  }
}
