import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z
  .object({
    displayName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(40, "Name is too long"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must include a letter")
      .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const reportSchema = z.object({
  reason: z.enum(["harassment", "spam", "inappropriate", "underage", "other"]),
  details: z.string().max(500).optional(),
});

export const addFriendSchema = z.object({
  username: z
    .string()
    .min(2, "Enter a username or email")
    .max(64, "Too long"),
});

export const profileSchema = z.object({
  displayName: z.string().min(2).max(40),
  bio: z.string().max(160).optional(),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional(),
  interests: z.array(z.string().min(1).max(24)).max(20).optional(),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ReportValues = z.infer<typeof reportSchema>;
export type AddFriendValues = z.infer<typeof addFriendSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
