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
import { ProductMark } from "@/components/layout/ProductMark";
import { useAuth } from "@/lib/client/useAuth";
import { emailRules, passwordRules } from "@/lib/validation";

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
    <Stack gap={8}>
      <ProductMark />
      <Box>
        <Heading as="h1" fontFamily="body" fontSize="2xl" fontWeight="semibold">
          Create an account
        </Heading>
        <Text color="fg.muted" mt={2}>
          Your contacts, in one place.
        </Text>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={5}>
          <Field.Root invalid={!!errors.full_name}>
            <Field.Label>Full name</Field.Label>
            <Input
              type="text"
              size="lg"
              autoComplete="name"
              {...register("full_name")}
            />
          </Field.Root>

          <Field.Root invalid={!!errors.email}>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              size="lg"
              autoComplete="username"
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
              size="lg"
              autoComplete="new-password"
              {...register("password", passwordRules)}
            />
            {errors.password && (
              <Field.ErrorText>{errors.password.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.confirmPassword}>
            <Field.Label>Confirm password</Field.Label>
            <Input
              type="password"
              size="lg"
              autoComplete="new-password"
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
            <Text color="fg.error" fontSize="sm">
              {error}
            </Text>
          )}

          <Button
            type="submit"
            colorPalette="teal"
            size="lg"
            mt={1}
            loading={isSubmitting || signUpMutation.isPending}
            width="full"
          >
            Sign up
          </Button>
        </Stack>
      </form>

      <Text color="fg.muted" fontSize="sm">
        Already have an account?{" "}
        <Link asChild color="teal.fg" fontWeight="medium">
          <NextLink href="/login">Sign in</NextLink>
        </Link>
      </Text>
    </Stack>
  );
}
