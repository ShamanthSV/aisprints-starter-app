import { getToken } from "@/lib/auth-token";

/**
 * Sprint 1 — `docs/sprint-1/prd-auth-frontend.mdc`: central `Authorization: Bearer` for client `fetch` to protected APIs.
 * Pass `token` explicitly when known; otherwise reads `quizmaker_auth_token` in the browser only.
 */
export function bearerAuthHeader(token: string): HeadersInit {
	return { Authorization: `Bearer ${token}` };
}

export type AuthFetchInit = RequestInit & {
	/** When set, adds `Authorization: Bearer …`. When omitted in the browser, uses `getToken()`. */
	token?: string | null;
};

export function authFetch(input: RequestInfo | URL, init: AuthFetchInit = {}): Promise<Response> {
	const { token: tokenOpt, headers: initHeaders, ...rest } = init;
	const token =
		tokenOpt !== undefined ? tokenOpt : typeof window !== "undefined" ? getToken() : null;

	const headers = new Headers(initHeaders);
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	return fetch(input, { ...rest, headers });
}
