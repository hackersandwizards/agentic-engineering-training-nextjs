"use client";

import { Checkbox, Field, Input } from "@chakra-ui/react";
import { useMutationWithInvalidation } from "@/lib/client/useMutationWithInvalidation";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { UsersApi, type UserPublic } from "@/lib/client/api";
import { validateEmail } from "@/lib/validation";
import { queryKeys } from "@/lib/client/queryKeys";
import { FormDialog } from "@/components/FormDialog";

interface EditUserFormData {
  email: string;
  password?: string;
  full_name?: string;
  is_superuser: boolean;
  is_active: boolean;
}

interface EditUserDialogProps {
  user: UserPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditUserFormData>();

  useEffect(() => {
    if (open) {
      reset({
        email: user.email,
        full_name: user.fullName || "",
        is_superuser: user.isSuperuser,
        is_active: user.isActive,
      });
    }
  }, [open, user, reset]);

  const mutation = useMutationWithInvalidation({
    invalidateKey: queryKeys.users,
    mutationFn: (data: EditUserFormData) => {
      const updateData: Parameters<typeof UsersApi.update>[1] = {
        email: data.email,
        full_name: data.full_name,
        is_superuser: data.is_superuser,
        is_active: data.is_active,
      };
      if (data.password) {
        updateData.password = data.password;
      }
      return UsersApi.update(user.id, updateData);
    },
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const onSubmit = (data: EditUserFormData) => {
    mutation.mutate(data);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit User"
      formId="edit-user-form"
      submitLabel="Save"
      onSubmit={handleSubmit(onSubmit)}
      isPending={mutation.isPending}
      isError={mutation.isError}
      error={mutation.error}
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
        />
        {errors.email && (
          <Field.ErrorText>{errors.email.message}</Field.ErrorText>
        )}
      </Field.Root>

      <Field.Root>
        <Field.Label>New Password (leave blank to keep)</Field.Label>
        <Input
          type="password"
          {...register("password", {
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
          placeholder="Enter new password"
        />
        {errors.password && (
          <Field.ErrorText>{errors.password.message}</Field.ErrorText>
        )}
      </Field.Root>

      <Field.Root>
        <Field.Label>Full Name</Field.Label>
        <Input {...register("full_name")} />
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

      <Controller
        name="is_active"
        control={control}
        render={({ field }) => (
          <Checkbox.Root
            checked={field.value}
            onCheckedChange={(e) => field.onChange(e.checked === true)}
          >
            <Checkbox.HiddenInput onBlur={field.onBlur} />
            <Checkbox.Control />
            <Checkbox.Label>Active</Checkbox.Label>
          </Checkbox.Root>
        )}
      />
    </FormDialog>
  );
}
