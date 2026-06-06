import { NextRequest } from "next/server";
import { withAuth, successResponse } from "@/lib/api-utils";
import { excludePassword } from "@/lib/auth";

export const POST = withAuth(
  async (request: NextRequest, user) => {
    return successResponse(excludePassword(user));
  },
  { errorLabel: "Test token error:" },
);
