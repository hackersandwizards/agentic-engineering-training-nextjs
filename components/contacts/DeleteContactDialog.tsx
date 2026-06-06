"use client";

import { ContactsApi, type Contact } from "@/lib/client/api";
import { queryKeys } from "@/lib/client/queryKeys";
import { GenericDeleteDialog } from "@/components/GenericDeleteDialog";

interface DeleteContactDialogProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteContactDialog({
  contact,
  open,
  onOpenChange,
}: DeleteContactDialogProps) {
  return (
    <GenericDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Contact"
      description={`Are you sure you want to delete the contact "${contact.organisation}"? This action cannot be undone.`}
      invalidateKey={queryKeys.contacts}
      onDelete={() => ContactsApi.delete(contact.id)}
    />
  );
}
