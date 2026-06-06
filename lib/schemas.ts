import { z } from "zod";
import { passwordSchema, validateEmail } from "./validation";

export const contactCreateSchema = z.object({
  organisation: z
    .string({ error: "Organisation is required" })
    .min(1, "Organisation is required")
    .max(255, "Organisation must be at most 255 characters"),
  description: z.string().optional(),
});

export const contactUpdateSchema = z.object({
  organisation: z
    .string()
    .min(1, "Organisation cannot be empty")
    .max(255, "Organisation must be at most 255 characters")
    .optional(),
  description: z.string().optional(),
});

export const userCreateSchema = z.object({
  email: z
    .string({ error: "Email and password are required" })
    .min(1, "Email and password are required")
    .refine(validateEmail, "Invalid email format"),
  password: z
    .string({ error: "Email and password are required" })
    .min(1, "Email and password are required")
    .pipe(passwordSchema),
  full_name: z.string().optional(),
  is_superuser: z.unknown().optional(),
});

export const signupSchema = userCreateSchema.omit({ is_superuser: true });

export const userUpdateSchema = z.object({
  email: z
    .string({ error: "Invalid email format" })
    .refine(validateEmail, "Invalid email format")
    .optional(),
  password: passwordSchema.optional(),
  full_name: z.string().optional(),
  is_superuser: z.unknown().optional(),
  is_active: z.unknown().optional(),
});

export const userUpdateMeSchema = z.object({
  email: z
    .string({ error: "Invalid email format" })
    .refine(validateEmail, "Invalid email format")
    .optional(),
  full_name: z.string().optional(),
});

export const passwordChangeSchema = z.object({
  current_password: z
    .string({ error: "Current password and new password are required" })
    .min(1, "Current password and new password are required"),
  new_password: z
    .string({ error: "Current password and new password are required" })
    .min(1, "Current password and new password are required"),
});
