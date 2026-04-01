import { z } from "zod";

/** Client validation aligned with `docs/sprint-1/prd-auth-contract-env.mdc` + API Zod (`signupRequestSchema`). */
const emailField = z
	.string()
	.min(1, "Email is required")
	.email("Enter a valid email")
	.transform((s) => s.trim().toLowerCase());

export const signupFormSchema = z
	.object({
		name: z.string().min(1, "Name is required").max(200),
		email: emailField,
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Confirm your password"),
	})
	.strict()
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords must match",
		path: ["confirmPassword"],
	});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
