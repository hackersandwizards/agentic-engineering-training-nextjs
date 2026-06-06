"use client";

import {
  Button,
  Dialog,
  Portal,
  Field,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ContactsApi, type Contact } from "@/lib/client/api";

interface EditContactFormData {
  organisation: string;
  description?: string;
}

interface EditContactDialogProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditContactDialog({
  contact,
  open,
  onOpenChange,
}: EditContactDialogProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditContactFormData>();

  useEffect(() => {
    if (open) {
      reset({
        organisation: contact.organisation,
        description: contact.description || "",
      });
    }
  }, [open, contact, reset]);

  const mutation = useMutation({
    mutationFn: (data: EditContactFormData) =>
      ContactsApi.update(contact.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      onOpenChange(false);
    },
  });

  const onSubmit = (data: EditContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit Contact</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form id="edit-contact-form" onSubmit={handleSubmit(onSubmit)}>
                <Stack gap={4}>
                  <Field.Root invalid={!!errors.organisation}>
                    <Field.Label>Organisation</Field.Label>
                    <Input
                      {...register("organisation", {
                        required: "Organisation is required",
                        maxLength: {
                          value: 255,
                          message:
                            "Organisation must be at most 255 characters",
                        },
                      })}
                      placeholder="Enter organisation name"
                    />
                    {errors.organisation && (
                      <Field.ErrorText>
                        {errors.organisation.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Description</Field.Label>
                    <Textarea
                      {...register("description")}
                      placeholder="Enter description (optional)"
                    />
                  </Field.Root>

                  {mutation.isError && (
                    <Text color="red.500" fontSize="sm">
                      {(mutation.error as Error).message}
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
                form="edit-contact-form"
                colorScheme="blue"
                loading={mutation.isPending}
              >
                Save
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
