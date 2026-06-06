"use client";

import { Button, Dialog, Portal, Text } from "@chakra-ui/react";
import { useMutationWithInvalidation } from "@/lib/client/useMutationWithInvalidation";

interface GenericDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  invalidateKey: readonly unknown[];
  onDelete: () => Promise<unknown>;
  onSuccess?: () => void;
}

export function GenericDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  invalidateKey,
  onDelete,
  onSuccess,
}: GenericDeleteDialogProps) {
  const mutation = useMutationWithInvalidation({
    invalidateKey,
    mutationFn: onDelete,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>{description}</Text>
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
                {confirmLabel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
