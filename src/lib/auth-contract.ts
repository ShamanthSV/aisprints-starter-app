/**
 * Types and Zod schemas aligned with `docs/sprint-1/prd-auth-contract-env.mdc` §2–§3 (and JWT §4 where noted).
 * Canonical API paths: use `AUTH_API_PATHS` — do not duplicate string literals elsewhere.
 */
import { z } from "zod";

/** JWT access lifetime in seconds (7 days) — must match issue/verify and login `expiresIn` (§3–§4). */
export const ACCESS_TOKEN_EXPIRES_SEC = 604800;

/** Client `localStorage` key for the access JWT (§2.2). */
export const QUIZMAKER_AUTH_TOKEN_STORAGE_KEY = "quizmaker_auth_token" as const;

/** Normative relative URLs — `docs/sprint-1/prd-auth-contract-env.mdc` §1. `me` is GET `/api/me`, not `/api/auth/me`. */
export const AUTH_API_PATHS = {
	signup: "/api/auth/signup",
	login: "/api/auth/login",
	logout: "/api/auth/logout",
	me: "/api/me",
} as const;

/** Normalize email for storage and lookup (contract §2.1). */
const normalizedEmailSchema = z
	.string()
	.email()
	.transform((s) => s.trim().toLowerCase());

export const signupRequestSchema = z
	.object({
		email: normalizedEmailSchema,
		password: z.string().min(8, "Password must be at least 8 characters"),
		name: z.string().min(1, "Name is required").max(200),
	})
	.strict();

export const loginRequestSchema = z
	.object({
		email: normalizedEmailSchema,
		password: z.string().min(1, "Password is required"),
	})
	.strict();

export type SignupRequest = z.infer<typeof signupRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;

const userPublicSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string(),
	createdAt: z.string(),
});

/** §2.1 success — 201 */
export const signupSuccessSchema = z.object({ user: userPublicSchema }).strict();

const loginUserSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string(),
});

/** §2.2 success — 200 (full contract; JWT issued in Phase C). */
export const loginSuccessSchema = z
	.object({
		token: z.string(),
		tokenType: z.literal("Bearer"),
		expiresIn: z.number().int().positive(),
		user: loginUserSchema,
	})
	.strict();

/** Legacy Phase B shape; superseded by **`loginSuccessSchema`** once Phase C+ **`POST /api/auth/login`** issues JWTs. */
export const loginPhaseBResponseSchema = z.object({ user: loginUserSchema }).strict();

/** §2.3 success — 200 */
export const meSuccessSchema = z.object({ user: userPublicSchema }).strict();

/** §2.5 — error responses */
export const apiErrorBodySchema = z
	.object({
		error: z.object({
			code: z.string(),
			message: z.string(),
		}),
	})
	.strict();

export type ErrorCode =
	| "VALIDATION_ERROR"
	| "INVALID_CREDENTIALS"
	| "EMAIL_ALREADY_EXISTS"
	| "UNAUTHORIZED"
	| "INTERNAL_ERROR";

export type ApiErrorBody = {
	error: {
		code: ErrorCode;
		message: string;
	};
};

export type UserPublic = {
	id: string;
	email: string;
	name: string;
	createdAt: string;
};

export type SignupSuccess = z.infer<typeof signupSuccessSchema>;
export type LoginSuccess = z.infer<typeof loginSuccessSchema>;
export type LoginPhaseBResponse = z.infer<typeof loginPhaseBResponseSchema>;
export type MeSuccess = z.infer<typeof meSuccessSchema>;
