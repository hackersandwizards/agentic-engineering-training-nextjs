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

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name?: string;
}

export default function SignupPage() {
  const { signUpMutation, error, resetError } = useAuth();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>();

  const onSubmit = async (data: SignupFormData) => {
    resetError();
    signUpMutation.mutate({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
    });
  };

  return (
    <Box>
      <Stack gap={6}>
        <Box textAlign="center">
          <Heading size="xl">Create an account</Heading>
          <Text color="gray.600" mt={2}>
            Sign up to get started
          </Text>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4}>
            <Field.Root invalid={!!errors.full_name}>
              <Field.Label>Full Name</Field.Label>
              <Input
                type="text"
                placeholder="Enter your full name"
                {...register("full_name")}
              />
            </Field.Root>

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
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.password && (
                <Field.ErrorText>{errors.password.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.confirmPassword}>
              <Field.Label>Confirm Password</Field.Label>
              <Input
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <Field.ErrorText>
                  {errors.confirmPassword.message}
                </Field.ErrorText>
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
              loading={isSubmitting || signUpMutation.isPending}
              width="full"
            >
              Sign up
            </Button>
          </Stack>
        </form>

        <Text textAlign="center" color="gray.600">
          Already have an account?{" "}
          <Link asChild color="blue.500">
            <NextLink href="/login">Sign in</NextLink>
          </Link>
        </Text>
      </Stack>
    </Box>
  );
}
