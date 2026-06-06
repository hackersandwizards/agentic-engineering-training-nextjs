import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  return "TheKeyForDevModeNoIssueIfShared";
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function createAccessToken(userId: string, email: string): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(
    {
      sub: userId,
      email,
    },
    getJwtSecret(),
    options,
  );
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

const DUMMY_PASSWORD_HASH =
  "$2b$10$Lr0p5Jpo87WPHol0xdG8/.YGtOScFcl0xPORGZTi228eRRwBVOfMW";

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  const isValid = await verifyPassword(
    password,
    user?.hashedPassword ?? DUMMY_PASSWORD_HASH,
  );

  if (!user || !user.isActive || !isValid) {
    return null;
  }

  return user;
}

export async function getCurrentUser(token: string) {
  const payload = verifyAccessToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export function excludePassword<T extends { hashedPassword: string }>(
  user: T,
): Omit<T, "hashedPassword"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hashedPassword: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  isActive: true,
  isSuperuser: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const contactOwnerInclude = {
  owner: { select: { id: true, email: true, fullName: true } },
} satisfies Prisma.ContactInclude;
