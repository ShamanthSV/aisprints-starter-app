import { z } from "zod";

/** Client validation aligned with `loginRequestSchema` (`docs/sprint-1/prd-auth-contract-env.mdc` §2.2). */
const emailField = z
	.string()
	.min(1, "Email is required")
	.email("Enter a valid email")
	.transform((s) => s.trim().toLowerCase());

export const loginFormSchema = z
	.object({
		email: emailField,
		password: z.string().min(1, "Password is required"),
	})
	.strict();

export type LoginFormValues = z.infer<typeof loginFormSchema>;
