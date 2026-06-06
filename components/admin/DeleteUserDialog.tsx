"use client";

import { Button, Dialog, Portal, Text } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersApi, type UserPublic } from "@/lib/client/api";

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
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => UsersApi.delete(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete User</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                Are you sure you want to delete the user &quot;{user.email}
                &quot;? This action cannot be undone and all their data will be
                permanently removed.
              </Text>
              {mutation.isError && (
                <Text color="red.500" fontSize="sm" mt={3}>
                  {(mutation.error as Error).message}
                </Text>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="ghost">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                colorScheme="red"
                onClick={() => mutation.mutate()}
                loading={mutation.isPending}
              >
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
