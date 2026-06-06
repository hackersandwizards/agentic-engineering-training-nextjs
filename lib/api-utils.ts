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
  // The web app authenticates via an httpOnly cookie; external API clients send
  // a Bearer token. Accept either.
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

// Returns a 403 response if the user is neither the resource owner nor a
// superuser, otherwise null. Centralizes the ownership check used by the
// per-resource routes.
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

// True when a Prisma write failed a unique constraint (e.g. duplicate email),
// so the route can return 409 instead of a generic 500.
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

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (password.length > 40) {
    return "Password must be at most 40 characters";
  }
  return null;
}
