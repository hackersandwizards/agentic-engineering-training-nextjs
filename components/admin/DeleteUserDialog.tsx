"use client";

import { UsersApi, type UserPublic } from "@/lib/client/api";
import { queryKeys } from "@/lib/client/queryKeys";
import { GenericDeleteDialog } from "@/components/GenericDeleteDialog";

interface DeleteUserDialogProps {
  user: UserPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
  return (
    <GenericDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete User"
      description={`Are you sure you want to delete the user "${user.email}"? This action cannot be undone and all their data will be permanently removed.`}
      invalidateKey={queryKeys.users}
      onDelete={() => UsersApi.delete(user.id)}
    />
  );
}
