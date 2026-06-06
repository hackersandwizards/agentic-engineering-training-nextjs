"use client";

import {
  Button,
  Checkbox,
  Dialog,
  Portal,
  Field,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { UsersApi } from "@/lib/client/api";

interface AddUserFormData {
  email: string;
  password: string;
  full_name?: string;
  is_superuser: boolean;
}

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddUserFormData>({
    defaultValues: { is_superuser: false },
  });

  const mutation = useMutation({
    mutationFn: (data: AddUserFormData) => UsersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: AddUserFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Button colorScheme="blue">Add User</Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Add User</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form id="add-user-form" onSubmit={handleSubmit(onSubmit)}>
                <Stack gap={4}>
                  <Field.Root invalid={!!errors.email}>
                    <Field.Label>Email</Field.Label>
                    <Input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address",
                        },
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
                      <Field.ErrorText>
                        {errors.password.message}
                      </Field.ErrorText>
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
                        onCheckedChange={(e) =>
                          field.onChange(e.checked === true)
                        }
                      >
                        <Checkbox.HiddenInput onBlur={field.onBlur} />
                        <Checkbox.Control />
                        <Checkbox.Label>Super user</Checkbox.Label>
                      </Checkbox.Root>
                    )}
                  />

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
                form="add-user-form"
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
