import { afterEach, describe, expect, it, vi } from "vitest";

import { authFetch, bearerAuthHeader } from "./auth-fetch";

describe("auth-fetch", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("bearerAuthHeader sets Authorization: Bearer", () => {
		expect(bearerAuthHeader("tok")).toEqual({ Authorization: "Bearer tok" });
	});

	it("authFetch attaches Bearer token when token is passed (same-origin relative URLs in app)", async () => {
		const fetchSpy = vi.fn().mockResolvedValue(
			new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
		);
		vi.stubGlobal("fetch", fetchSpy);

		await authFetch("http://127.0.0.1:3000/api/me", { method: "GET", token: "jwt-here" });

		expect(fetchSpy).toHaveBeenCalledTimes(1);
		const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
		expect(new Headers(init.headers).get("Authorization")).toBe("Bearer jwt-here");
	});
});
