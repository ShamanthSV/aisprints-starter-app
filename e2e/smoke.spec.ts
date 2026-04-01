import { expect, test } from "@playwright/test";

/**
 * Phase A — wiring only (`docs/sprint-1/prd-auth-e2e.mdc`).
 * Critical auth flows live in Phase B (`e2e/auth.spec.ts` or split specs).
 */
test.describe("app shell", () => {
	test("login page renders without auth setup", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();
	});
});
