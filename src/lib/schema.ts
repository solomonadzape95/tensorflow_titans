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
