import { describe, expect, it } from "vitest";

import { AUTH_API_PATHS, signupRequestSchema } from "./auth-contract";

describe("auth-contract", () => {
	it("uses GET /api/me for current user (not /api/auth/me)", () => {
		expect(AUTH_API_PATHS.me).toBe("/api/me");
	});

	it("lowercases signup email per Sprint 1 contract", () => {
		const parsed = signupRequestSchema.parse({
			email: "User@Example.com",
			password: "password1",
			name: "Teacher",
		});
		expect(parsed.email).toBe("user@example.com");
	});
});
