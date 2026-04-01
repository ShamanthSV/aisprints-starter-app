import { QUIZMAKER_AUTH_TOKEN_STORAGE_KEY } from "@/lib/auth-contract";

export function getToken(): string | null {
	if (typeof window === "undefined") {
		return null;
	}
	return window.localStorage.getItem(QUIZMAKER_AUTH_TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
	window.localStorage.setItem(QUIZMAKER_AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
	window.localStorage.removeItem(QUIZMAKER_AUTH_TOKEN_STORAGE_KEY);
}
