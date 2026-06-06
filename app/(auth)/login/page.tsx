"use client";

import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import NextLink from "next/link";
import { useAuth } from "@/lib/client/useAuth";
import { emailRules } from "@/lib/validation";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { loginMutation, error, resetError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    resetError();
    loginMutation.mutate(data);
  };

  return (
    <Box>
      <Stack gap={6}>
        <Box textAlign="center">
          <Heading size="xl">Welcome back</Heading>
          <Text color="gray.600" mt={2}>
            Sign in to your account
          </Text>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4}>
            <Field.Root invalid={!!errors.email}>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                placeholder="Enter your email"
                {...register("email", emailRules)}
              />
              {errors.email && (
                <Field.ErrorText>{errors.email.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.password}>
              <Field.Label>Password</Field.Label>
              <Input
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                })}
              />
              {errors.password && (
                <Field.ErrorText>{errors.password.message}</Field.ErrorText>
              )}
            </Field.Root>

            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              loading={isSubmitting || loginMutation.isPending}
              width="full"
            >
              Sign in
            </Button>
          </Stack>
        </form>

        <Text textAlign="center" color="gray.600">
          Don&apos;t have an account?{" "}
          <Link asChild color="blue.500">
            <NextLink href="/signup">Sign up</NextLink>
          </Link>
        </Text>
      </Stack>
    </Box>
  );
}
