import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { contactOwnerInclude } from "@/lib/auth";
import {
  withAuth,
  successResponse,
  parseQueryParams,
  parseBody,
} from "@/lib/api-utils";
import { contactCreateSchema } from "@/lib/schemas";

export const GET = withAuth(
  async (request: NextRequest, user) => {
    const { skip, limit } = parseQueryParams(request);

    const whereClause = user.isSuperuser ? {} : { ownerId: user.id };

    const [contacts, count] = await Promise.all([
      prisma.contact.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: contactOwnerInclude,
      }),
      prisma.contact.count({ where: whereClause }),
    ]);

    return successResponse({
      data: contacts,
      count,
    });
  },
  { errorLabel: "List contacts error:" },
);

export const POST = withAuth(
  async (request: NextRequest, user) => {
    const parsed = await parseBody(request, contactCreateSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const { organisation, description } = parsed.data;

    const contact = await prisma.contact.create({
      data: {
        organisation,
        description: description || null,
        ownerId: user.id,
      },
      include: contactOwnerInclude,
    });

    return successResponse(contact, 201);
  },
  { errorLabel: "Create contact error:" },
);
