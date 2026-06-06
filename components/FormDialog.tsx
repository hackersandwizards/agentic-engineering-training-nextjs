"use client";

import { Button, Dialog, Portal, Stack, Text } from "@chakra-ui/react";
import type { FormEventHandler, ReactNode } from "react";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formId: string;
  submitLabel: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  trigger?: ReactNode;
  children: ReactNode;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  formId,
  submitLabel,
  onSubmit,
  isPending,
  isError,
  error,
  trigger,
  children,
}: FormDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form id={formId} onSubmit={onSubmit}>
                <Stack gap={4}>
                  {children}
                  {isError && error && (
                    <Text color="red.500" fontSize="sm">
                      {error.message}
                    </Text>
                  )}
                </Stack>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="ghost">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                type="submit"
                form={formId}
                colorScheme="blue"
                loading={isPending}
              >
                {submitLabel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
