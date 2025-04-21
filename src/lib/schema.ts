import * as z from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Please enter a valid email address"),
    fullName: z
      .string({ required_error: "Full name is required" })
      .min(2, "Name must be at least 2 characters"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    password_confirmation: z
      .string({ required_error: "Please confirm your password" })
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"], // path of error
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password cannot be empty"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema for creating a group
export const createGroupSchema = z.object({
  name: z.string().min(1, { message: "Group name is required" }),
  description: z.string().optional(),
  selectedMembers: z
    .array(z.string())
    .min(1, { message: "At least one member is required" }),
});

export type CreateGroupFormData = z.infer<typeof createGroupSchema>;

// Schema for inviting a user to a group by email
export const inviteToGroupSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address"),
});

export type InviteToGroupFormData = z.infer<typeof inviteToGroupSchema>;
export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;
export const createExpenseSchema = z.object({
  name: z.string().min(1, { message: "Expense name is required" }),
  description: z.string().optional(),
  payer_id: z.string().min(1, { message: "Payer ID is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  expense_date: z.date({required_error: "Expense date is required"}),
  group_id: z.string().min(1, { message: "Group is required" }),
  split_type: z.string().min(1, { message: "Split Type is required" }),
});
