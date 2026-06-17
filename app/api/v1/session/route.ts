import { NextRequest } from "next/server";
import { excludePassword } from "@/lib/auth";
import { getAuthenticatedUser, successResponse } from "@/lib/api-utils";

// Returns the current user, or null when not authenticated. Always 200 so a
// logged-out session check is not logged as an error by the browser console.
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  return successResponse(user ? excludePassword(user) : null);
}
