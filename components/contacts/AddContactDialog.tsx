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
import { useMutationWithInvalidation } from "@/lib/client/useMutationWithInvalidation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ContactsApi } from "@/lib/client/api";
import { queryKeys } from "@/lib/client/queryKeys";

interface AddContactFormData {
  organisation: string;
  description?: string;
}

export function AddContactDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddContactFormData>();

  const mutation = useMutationWithInvalidation({
    invalidateKey: queryKeys.contacts,
    mutationFn: (data: AddContactFormData) => ContactsApi.create(data),
    onSuccess: () => {
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: AddContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Button colorScheme="blue">Add Contact</Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Add Contact</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form id="add-contact-form" onSubmit={handleSubmit(onSubmit)}>
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
                form="add-contact-form"
                colorScheme="blue"
                loading={mutation.isPending}
              >
                Add
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
