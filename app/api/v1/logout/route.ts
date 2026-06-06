import { NextResponse } from "next/server";

// Clears the auth cookie set at login.
export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.delete("access_token");
  return response;
}
