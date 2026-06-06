import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, errorResponse, successResponse } from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ contactId: string }>;
}

// GET /api/v1/contacts/[contactId] - Get contact by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { contactId } = await params;
    const result = await requireAuth(request);
    if ("error" in result) {
      return result.error;
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!contact) {
      return errorResponse(404, "Contact not found");
    }

    // Check permission: owner or superuser
    if (contact.ownerId !== result.user.id && !result.user.isSuperuser) {
      return errorResponse(403, "Not enough permissions");
    }

    return successResponse(contact);
  } catch (error) {
    console.error("Get contact error:", error);
    return errorResponse(500, "Internal server error");
  }
}

// PUT /api/v1/contacts/[contactId] - Update contact by ID
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { contactId } = await params;
    const result = await requireAuth(request);
    if ("error" in result) {
      return result.error;
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return errorResponse(404, "Contact not found");
    }

    // Check permission: owner or superuser
    if (contact.ownerId !== result.user.id && !result.user.isSuperuser) {
      return errorResponse(403, "Not enough permissions");
    }

    const body = await request.json();
    const { organisation, description } = body;

    const updateData: { organisation?: string; description?: string | null } =
      {};

    if (organisation !== undefined) {
      if (!organisation) {
        return errorResponse(400, "Organisation cannot be empty");
      }
      if (organisation.length > 255) {
        return errorResponse(
          400,
          "Organisation must be at most 255 characters",
        );
      }
      updateData.organisation = organisation;
    }

    if (description !== undefined) {
      updateData.description = description || null;
    }

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return successResponse(updatedContact);
  } catch (error) {
    console.error("Update contact error:", error);
    return errorResponse(500, "Internal server error");
  }
}

// DELETE /api/v1/contacts/[contactId] - Delete contact by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { contactId } = await params;
    const result = await requireAuth(request);
    if ("error" in result) {
      return result.error;
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return errorResponse(404, "Contact not found");
    }

    // Check permission: owner or superuser
    if (contact.ownerId !== result.user.id && !result.user.isSuperuser) {
      return errorResponse(403, "Not enough permissions");
    }

    await prisma.contact.delete({
      where: { id: contactId },
    });

    return successResponse({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Delete contact error:", error);
    return errorResponse(500, "Internal server error");
  }
}
