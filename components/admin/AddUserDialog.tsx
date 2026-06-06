"use client";

import { Button, Field, Input } from "@chakra-ui/react";
import { useMutationWithInvalidation } from "@/lib/client/useMutationWithInvalidation";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { UsersApi } from "@/lib/client/api";
import { emailRules, passwordRules } from "@/lib/validation";
import { queryKeys } from "@/lib/client/queryKeys";
import { FormDialog } from "@/components/FormDialog";
import { CheckboxField } from "@/components/CheckboxField";

interface AddUserFormData {
  email: string;
  password: string;
  full_name?: string;
  is_superuser: boolean;
}

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddUserFormData>({
    defaultValues: { is_superuser: false },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const mutation = useMutationWithInvalidation({
    invalidateKey: queryKeys.users,
    mutationFn: (data: AddUserFormData) => UsersApi.create(data),
    onSuccess: () => {
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: AddUserFormData) => {
    mutation.mutate(data);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="Add User"
      formId="add-user-form"
      submitLabel="Add"
      onSubmit={handleSubmit(onSubmit)}
      isPending={mutation.isPending}
      isError={mutation.isError}
      error={mutation.error}
      trigger={<Button colorScheme="blue">Add User</Button>}
    >
      <Field.Root invalid={!!errors.email}>
        <Field.Label>Email</Field.Label>
        <Input
          type="email"
          {...register("email", emailRules)}
          placeholder="Enter email"
        />
        {errors.email && (
          <Field.ErrorText>{errors.email.message}</Field.ErrorText>
        )}
      </Field.Root>

      <Field.Root invalid={!!errors.password}>
        <Field.Label>Password</Field.Label>
        <Input
          type="password"
          {...register("password", passwordRules)}
          placeholder="Enter password"
        />
        {errors.password && (
          <Field.ErrorText>{errors.password.message}</Field.ErrorText>
        )}
      </Field.Root>

      <Field.Root>
        <Field.Label>Full Name</Field.Label>
        <Input
          {...register("full_name")}
          placeholder="Enter full name (optional)"
        />
      </Field.Root>

      <CheckboxField control={control} name="is_superuser" label="Super user" />
    </FormDialog>
  );
}
