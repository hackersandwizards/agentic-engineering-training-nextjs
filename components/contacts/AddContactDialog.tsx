"use client";

import { Button, Field, Input, Textarea } from "@chakra-ui/react";
import { useMutationWithInvalidation } from "@/lib/client/useMutationWithInvalidation";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { ContactsApi } from "@/lib/client/api";
import { organisationRules } from "@/lib/validation";
import { queryKeys } from "@/lib/client/queryKeys";
import { FormDialog } from "@/components/FormDialog";

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

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

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
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="Add Contact"
      formId="add-contact-form"
      submitLabel="Add"
      onSubmit={handleSubmit(onSubmit)}
      isPending={mutation.isPending}
      isError={mutation.isError}
      error={mutation.error}
      trigger={<Button colorScheme="blue">Add Contact</Button>}
    >
      <Field.Root invalid={!!errors.organisation}>
        <Field.Label>Organisation</Field.Label>
        <Input
          {...register("organisation", organisationRules)}
          placeholder="Enter organisation name"
        />
        {errors.organisation && (
          <Field.ErrorText>{errors.organisation.message}</Field.ErrorText>
        )}
      </Field.Root>

      <Field.Root>
        <Field.Label>Description</Field.Label>
        <Textarea
          {...register("description")}
          placeholder="Enter description (optional)"
        />
      </Field.Root>
    </FormDialog>
  );
}
