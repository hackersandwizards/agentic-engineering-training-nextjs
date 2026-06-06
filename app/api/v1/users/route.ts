import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, excludePassword, publicUserSelect } from "@/lib/auth";
import {
  withAuth,
  errorResponse,
  successResponse,
  parseQueryParams,
  validateEmail,
  validatePassword,
  parseJsonBody,
  isUniqueConstraintError,
} from "@/lib/api-utils";

export const GET = withAuth(
  async (request: NextRequest) => {
    const { skip, limit } = parseQueryParams(request);

    const [users, count] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: publicUserSelect,
      }),
      prisma.user.count(),
    ]);

    return successResponse({
      data: users,
      count,
    });
  },
  { superuser: true, errorLabel: "List users error:" },
);

export const POST = withAuth(
  async (request: NextRequest) => {
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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(400, "The user with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    try {
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
      if (isUniqueConstraintError(error)) {
        return errorResponse(409, "The user with this email already exists");
      }
      throw error;
    }
  },
  { superuser: true, errorLabel: "Create user error:" },
);
