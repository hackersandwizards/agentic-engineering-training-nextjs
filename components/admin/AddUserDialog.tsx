"use client";

import { Button, Checkbox, Field, Input } from "@chakra-ui/react";
import { useMutationWithInvalidation } from "@/lib/client/useMutationWithInvalidation";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { UsersApi } from "@/lib/client/api";
import { validateEmail } from "@/lib/validation";
import { queryKeys } from "@/lib/client/queryKeys";
import { FormDialog } from "@/components/FormDialog";

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
          {...register("email", {
            required: "Email is required",
            validate: (value) =>
              validateEmail(value) || "Invalid email address",
          })}
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
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
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

      <Controller
        name="is_superuser"
        control={control}
        render={({ field }) => (
          <Checkbox.Root
            checked={field.value}
            onCheckedChange={(e) => field.onChange(e.checked === true)}
          >
            <Checkbox.HiddenInput onBlur={field.onBlur} />
            <Checkbox.Control />
            <Checkbox.Label>Super user</Checkbox.Label>
          </Checkbox.Root>
        )}
      />
    </FormDialog>
  );
}
