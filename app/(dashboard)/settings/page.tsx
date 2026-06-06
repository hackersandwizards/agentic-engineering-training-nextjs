"use client";

import {
  Box,
  Button,
  Dialog,
  Portal,
  Field,
  Heading,
  Input,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { UsersApi } from "@/lib/client/api";
import { useAuth } from "@/lib/client/useAuth";
import { validateEmail } from "@/lib/validation";

interface UserInfoFormData {
  email: string;
  full_name: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const userInfoForm = useForm<UserInfoFormData>({
    defaultValues: {
      email: user?.email || "",
      full_name: user?.fullName || "",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: UserInfoFormData) => UsersApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const passwordForm = useForm<PasswordFormData>();

  const changePasswordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      UsersApi.changePassword(data),
    onSuccess: () => {
      passwordForm.reset();
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => UsersApi.deleteMe(),
    onSuccess: () => {
      logout();
    },
  });

  return (
    <Box>
      <Stack gap={6}>
        <Heading size="xl">Settings</Heading>

        <Tabs.Root defaultValue="profile">
          <Tabs.List>
            <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
            <Tabs.Trigger value="password">Password</Tabs.Trigger>
            <Tabs.Trigger value="danger">Danger Zone</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="profile">
            <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mt={4}>
              <form
                onSubmit={userInfoForm.handleSubmit((data) =>
                  updateUserMutation.mutate(data),
                )}
              >
                <Stack gap={4} maxW="md">
                  <Field.Root invalid={!!userInfoForm.formState.errors.email}>
                    <Field.Label>Email</Field.Label>
                    <Input
                      {...userInfoForm.register("email", {
                        required: "Email is required",
                        validate: (value) =>
                          validateEmail(value) || "Invalid email address",
                      })}
                    />
                    {userInfoForm.formState.errors.email && (
                      <Field.ErrorText>
                        {userInfoForm.formState.errors.email.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Full Name</Field.Label>
                    <Input {...userInfoForm.register("full_name")} />
                  </Field.Root>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    alignSelf="flex-start"
                    loading={updateUserMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </form>
            </Box>
          </Tabs.Content>

          <Tabs.Content value="password">
            <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mt={4}>
              <form
                onSubmit={passwordForm.handleSubmit((data) =>
                  changePasswordMutation.mutate({
                    current_password: data.current_password,
                    new_password: data.new_password,
                  }),
                )}
              >
                <Stack gap={4} maxW="md">
                  <Field.Root
                    invalid={!!passwordForm.formState.errors.current_password}
                  >
                    <Field.Label>Current Password</Field.Label>
                    <Input
                      type="password"
                      {...passwordForm.register("current_password", {
                        required: "Current password is required",
                      })}
                    />
                    {passwordForm.formState.errors.current_password && (
                      <Field.ErrorText>
                        {passwordForm.formState.errors.current_password.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root
                    invalid={!!passwordForm.formState.errors.new_password}
                  >
                    <Field.Label>New Password</Field.Label>
                    <Input
                      type="password"
                      {...passwordForm.register("new_password", {
                        required: "New password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                    />
                    {passwordForm.formState.errors.new_password && (
                      <Field.ErrorText>
                        {passwordForm.formState.errors.new_password.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root
                    invalid={!!passwordForm.formState.errors.confirm_password}
                  >
                    <Field.Label>Confirm New Password</Field.Label>
                    <Input
                      type="password"
                      {...passwordForm.register("confirm_password", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === passwordForm.getValues("new_password") ||
                          "Passwords do not match",
                      })}
                    />
                    {passwordForm.formState.errors.confirm_password && (
                      <Field.ErrorText>
                        {passwordForm.formState.errors.confirm_password.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  {changePasswordMutation.isError && (
                    <Text color="red.500" fontSize="sm">
                      {(changePasswordMutation.error as Error).message}
                    </Text>
                  )}

                  {changePasswordMutation.isSuccess && (
                    <Text color="green.500" fontSize="sm">
                      Password changed successfully!
                    </Text>
                  )}

                  <Button
                    type="submit"
                    colorScheme="blue"
                    alignSelf="flex-start"
                    loading={changePasswordMutation.isPending}
                  >
                    Change Password
                  </Button>
                </Stack>
              </form>
            </Box>
          </Tabs.Content>

          <Tabs.Content value="danger">
            <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mt={4}>
              <Stack gap={4}>
                <Heading size="md" color="red.500">
                  Delete Account
                </Heading>
                <Text color="gray.600">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </Text>
                {user?.isSuperuser ? (
                  <Text color="gray.500" fontSize="sm">
                    Super users cannot delete their own account.
                  </Text>
                ) : (
                  <Button
                    colorScheme="red"
                    variant="outline"
                    alignSelf="flex-start"
                    onClick={() => setDeleteOpen(true)}
                  >
                    Delete My Account
                  </Button>
                )}
              </Stack>
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Stack>

      <Dialog.Root
        open={deleteOpen}
        onOpenChange={(e) => setDeleteOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete Account</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>
                  Are you sure you want to delete your account? This action
                  cannot be undone and all your data will be permanently
                  removed.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="ghost">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  colorScheme="red"
                  onClick={() => deleteAccountMutation.mutate()}
                  loading={deleteAccountMutation.isPending}
                >
                  Delete Account
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
