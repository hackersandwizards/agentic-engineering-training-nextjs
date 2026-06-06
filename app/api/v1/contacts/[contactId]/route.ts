import { prisma } from "@/lib/db";
import { contactOwnerInclude } from "@/lib/auth";
import {
  withAuth,
  errorResponse,
  successResponse,
  parseBody,
  assertOwnerOrSuperuser,
} from "@/lib/api-utils";
import { contactUpdateSchema } from "@/lib/schemas";

type RouteContext = { params: Promise<{ contactId: string }> };

export const GET = withAuth<RouteContext>(
  async (request, user, { params }) => {
    const { contactId } = await params;

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: contactOwnerInclude,
    });

    if (!contact) {
      return errorResponse(404, "Contact not found");
    }

    const permissionError = assertOwnerOrSuperuser(contact.ownerId, user);
    if (permissionError) {
      return permissionError;
    }

    return successResponse(contact);
  },
  { errorLabel: "Get contact error:" },
);

export const PUT = withAuth<RouteContext>(
  async (request, user, { params }) => {
    const { contactId } = await params;

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return errorResponse(404, "Contact not found");
    }

    const permissionError = assertOwnerOrSuperuser(contact.ownerId, user);
    if (permissionError) {
      return permissionError;
    }

    const parsed = await parseBody(request, contactUpdateSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const { organisation, description } = parsed.data;

    const updateData: { organisation?: string; description?: string | null } =
      {};

    if (organisation !== undefined) {
      updateData.organisation = organisation;
    }

    if (description !== undefined) {
      updateData.description = description || null;
    }

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: updateData,
      include: contactOwnerInclude,
    });

    return successResponse(updatedContact);
  },
  { errorLabel: "Update contact error:" },
);

export const DELETE = withAuth<RouteContext>(
  async (request, user, { params }) => {
    const { contactId } = await params;

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return errorResponse(404, "Contact not found");
    }

    const permissionError = assertOwnerOrSuperuser(contact.ownerId, user);
    if (permissionError) {
      return permissionError;
    }

    await prisma.contact.delete({
      where: { id: contactId },
    });

    return successResponse({ message: "Contact deleted successfully" });
  },
  { errorLabel: "Delete contact error:" },
);
