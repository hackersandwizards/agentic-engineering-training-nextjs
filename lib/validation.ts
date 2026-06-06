import { z } from "zod";

export const emailSchema = z.email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(40, "Password must be at most 40 characters");

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): string | null {
  const result = passwordSchema.safeParse(password);
  return result.success ? null : (result.error.issues[0]?.message ?? null);
}

export const emailRules = {
  required: "Email is required",
  validate: (value: string) => validateEmail(value) || "Invalid email address",
};

export const passwordRules = {
  required: "Password is required",
  validate: (value: string) => validatePassword(value) ?? true,
};

export const optionalPasswordRules = {
  validate: (value: string | undefined) =>
    !value || (validatePassword(value) ?? true),
};
