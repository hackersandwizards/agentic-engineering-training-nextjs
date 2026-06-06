"use client";

import { Field, Input, Textarea } from "@chakra-ui/react";
import { useMutationWithInvalidation } from "@/lib/client/useMutationWithInvalidation";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ContactsApi, type Contact } from "@/lib/client/api";
import { organisationRules } from "@/lib/validation";
import { queryKeys } from "@/lib/client/queryKeys";
import { FormDialog } from "@/components/FormDialog";

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

  const mutation = useMutationWithInvalidation({
    invalidateKey: queryKeys.contacts,
    mutationFn: (data: EditContactFormData) =>
      ContactsApi.update(contact.id, data),
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const onSubmit = (data: EditContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Contact"
      formId="edit-contact-form"
      submitLabel="Save"
      onSubmit={handleSubmit(onSubmit)}
      isPending={mutation.isPending}
      isError={mutation.isError}
      error={mutation.error}
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
