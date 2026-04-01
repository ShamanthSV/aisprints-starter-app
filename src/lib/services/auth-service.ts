import { AUTH_API_PATHS, type ApiErrorBody } from "@/lib/auth-contract";
import { authFetch } from "@/lib/auth-fetch";

const jsonHeaders = { "Content-Type": "application/json" };

export type SignupInput = { email: string; password: string; name: string };

/** Structured API failure for signup/login UI (`error.code` from contract §2.5). */
export class AuthApiError extends Error {
	constructor(
		message: string,
		public readonly status: number,
		public readonly code?: string,
	) {
		super(message);
		this.name = "AuthApiError";
	}

	isCode(c: string): boolean {
		return this.code === c;
	}
}

export type SignupSuccess = {
	user: { id: string; email: string; name: string; createdAt: string };
	/** Present only if product amends contract to return a token on signup; default flow uses login. */
	token?: string;
};

export async function signup(body: SignupInput): Promise<SignupSuccess> {
	const res = await fetch(AUTH_API_PATHS.signup, {
		method: "POST",
		headers: jsonHeaders,
		body: JSON.stringify(body),
	});
	const data: unknown = await res.json().catch(() => ({}));
	if (!res.ok) {
		const err = data as ApiErrorBody;
		throw new AuthApiError(err?.error?.message ?? "Could not create account", res.status, err?.error?.code);
	}
	return data as SignupSuccess;
}

export type LoginInput = { email: string; password: string };

/** `docs/sprint-1/prd-auth-contract-env.mdc` §2.2 */
export type LoginResponse = {
	token: string;
	tokenType: string;
	expiresIn: number;
	user: { id: string; email: string; name: string };
};

export async function login(body: LoginInput): Promise<LoginResponse> {
	const res = await fetch(AUTH_API_PATHS.login, {
		method: "POST",
		headers: jsonHeaders,
		body: JSON.stringify(body),
	});
	const data: unknown = await res.json().catch(() => ({}));
	if (!res.ok) {
		const err = data as ApiErrorBody;
		throw new AuthApiError(err?.error?.message ?? "Login failed", res.status, err?.error?.code);
	}
	return data as LoginResponse;
}

export async function fetchMe(token: string) {
	const res = await authFetch(AUTH_API_PATHS.me, {
		method: "GET",
		token,
	});
	const data: unknown = await res.json().catch(() => ({}));
	if (!res.ok) {
		const err = data as ApiErrorBody;
		throw new AuthApiError(err?.error?.message ?? "Could not load profile", res.status, err?.error?.code);
	}
	return data as { user: { id: string; email: string; name: string; createdAt: string } };
}

export async function logoutRequest() {
	await fetch(AUTH_API_PATHS.logout, { method: "POST" });
}
