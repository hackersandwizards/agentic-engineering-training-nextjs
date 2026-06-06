import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { Prisma, type User } from "@prisma/client";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(
  statusCode: number,
  message: string,
): NextResponse {
  return NextResponse.json({ detail: message }, { status: statusCode });
}

export function successResponse<T>(data: T, statusCode = 200): NextResponse {
  return NextResponse.json(data, { status: statusCode });
}

export async function parseJsonBody<T>(
  request: NextRequest,
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    return { data: (await request.json()) as T };
  } catch {
    return { error: errorResponse(400, "Invalid JSON body") };
  }
}

export async function getAuthenticatedUser(
  request: NextRequest,
): Promise<User | null> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : (request.cookies.get("access_token")?.value ?? null);
  if (!token) {
    return null;
  }
  return getCurrentUser(token);
}

export async function requireAuth(
  request: NextRequest,
): Promise<{ user: User } | { error: NextResponse }> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return { error: errorResponse(401, "Not authenticated") };
  }
  return { user };
}

export async function requireSuperuser(
  request: NextRequest,
): Promise<{ user: User } | { error: NextResponse }> {
  const result = await requireAuth(request);
  if ("error" in result) {
    return result;
  }
  if (!result.user.isSuperuser) {
    return {
      error: errorResponse(403, "The user doesn't have enough privileges"),
    };
  }
  return result;
}

function parseNonNegativeInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export function assertOwnerOrSuperuser(
  ownerId: string,
  user: User,
  message = "Not enough permissions",
): NextResponse | null {
  if (ownerId !== user.id && !user.isSuperuser) {
    return errorResponse(403, message);
  }
  return null;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export function parseQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skip = parseNonNegativeInt(searchParams.get("skip"), 0);
  const limit = parseNonNegativeInt(searchParams.get("limit"), 100);
  return { skip, limit: Math.min(limit, 100) };
}

type RouteContext<P = Record<string, string>> = { params: Promise<P> };

export function withAuth<C extends RouteContext = RouteContext>(
  handler: (
    request: NextRequest,
    user: User,
    context: C,
  ) => Promise<NextResponse>,
  options: { superuser?: boolean; errorLabel?: string } = {},
) {
  return async (request: NextRequest, context: C): Promise<NextResponse> => {
    try {
      const result = options.superuser
        ? await requireSuperuser(request)
        : await requireAuth(request);
      if ("error" in result) {
        return result.error;
      }
      return await handler(request, result.user, context);
    } catch (error) {
      console.error(options.errorLabel ?? "Request error", error);
      return errorResponse(500, "Internal server error");
    }
  };
}

export { validateEmail, validatePassword } from "./validation";
