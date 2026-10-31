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
    <Stack gap={8}>
      <ProductMark />
      <Box>
        <Heading as="h1" fontFamily="body" fontSize="2xl" fontWeight="semibold">
          Sign in
        </Heading>
        <Text color="fg.muted" mt={2}>
          Your contacts, in one place.
        </Text>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={5}>
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
              autoComplete="current-password"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password && (
              <Field.ErrorText>{errors.password.message}</Field.ErrorText>
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
            loading={isSubmitting || loginMutation.isPending}
            width="full"
          >
            Sign in
          </Button>
        </Stack>
      </form>

      <Text color="fg.muted" fontSize="sm">
        No account yet?{" "}
        <Link asChild color="teal.fg" fontWeight="medium">
          <NextLink href="/signup">Create one</NextLink>
        </Link>
      </Text>
    </Stack>
  );
}
