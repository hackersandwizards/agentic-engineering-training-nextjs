import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  errorResponse,
  successResponse,
  parseJsonBody,
  assertOwnerOrSuperuser,
} from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ contactId: string }>;
}

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

    const permissionError = assertOwnerOrSuperuser(
      contact.ownerId,
      result.user,
    );
    if (permissionError) {
      return permissionError;
    }

    return successResponse(contact);
  } catch (error) {
    console.error("Get contact error:", error);
    return errorResponse(500, "Internal server error");
  }
}

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

    const permissionError = assertOwnerOrSuperuser(
      contact.ownerId,
      result.user,
    );
    if (permissionError) {
      return permissionError;
    }

    const parsed = await parseJsonBody<{
      organisation?: string;
      description?: string;
    }>(request);
    if ("error" in parsed) {
      return parsed.error;
    }
    const { organisation, description } = parsed.data;

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

    const permissionError = assertOwnerOrSuperuser(
      contact.ownerId,
      result.user,
    );
    if (permissionError) {
      return permissionError;
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
