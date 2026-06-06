import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  createAccessToken,
  excludePassword,
} from "@/lib/auth";
import { errorResponse, parseJsonBody } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let email: string;
    let password: string;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      email = formData.get("username") as string;
      password = formData.get("password") as string;
    } else {
      const parsed = await parseJsonBody<{
        username?: string;
        email?: string;
        password?: string;
      }>(request);
      if ("error" in parsed) {
        return parsed.error;
      }
      email = parsed.data.username || parsed.data.email || "";
      password = parsed.data.password || "";
    }

    if (!email || !password) {
      return errorResponse(400, "Email and password are required");
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return errorResponse(400, "Incorrect email or password");
    }

    const accessToken = createAccessToken(user.id, user.email);

    const authResponse = NextResponse.json({
      access_token: accessToken,
      token_type: "bearer",
      user: excludePassword(user),
    });
    authResponse.cookies.set("access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 8,
    });
    return authResponse;
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(500, "Internal server error");
  }
}
