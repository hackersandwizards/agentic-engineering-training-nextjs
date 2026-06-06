"use client";

import { Button, Dialog, Portal, Text } from "@chakra-ui/react";
import { ContactsApi, type Contact } from "@/lib/client/api";
import { queryKeys } from "@/lib/client/queryKeys";
import { useMutationWithInvalidation } from "@/lib/client/useMutationWithInvalidation";

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
  const mutation = useMutationWithInvalidation({
    invalidateKey: queryKeys.contacts,
    mutationFn: () => ContactsApi.delete(contact.id),
    onSuccess: () => {
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
              <Dialog.Title>Delete Contact</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                Are you sure you want to delete the contact &quot;
                {contact.organisation}&quot;? This action cannot be undone.
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
