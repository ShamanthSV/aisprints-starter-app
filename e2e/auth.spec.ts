import { expect, test } from "@playwright/test";

import * as auth from "./fixtures/auth";
import { clearStorage, uniqueEmail } from "./fixtures/helpers";

/**
 * Phase B — `docs/sprint-1/prd-auth-e2e.mdc` scenario table + `prd-auth-contract-env.mdc`.
 * Requires local app with D1 + `AUTH_JWT_SECRET` (e.g. `npm run dev` with `.dev.vars`).
 */
test.describe("auth (Sprint 1)", () => {
	test.beforeEach(async ({ page }) => {
		await clearStorage(page);
	});

	test("signup success: redirects to login with hint; password not exposed as visible text", async ({ page }) => {
		const password = auth.E2E_PASSWORD;
		const email = uniqueEmail("signup", test.info().parallelIndex);
		const name = "E2E Signup";

		await page.goto("/signup");
		await auth.fillSignupForm(page, { name, email, password });
		await auth.submitSignup(page);

		await expect(page).toHaveURL(/\/login.*registered=1/);
		await expect(page.getByText(/account created/i)).toBeVisible();
		await expect(page.getByText(password, { exact: true })).toHaveCount(0);
	});

	test("duplicate email: second signup shows 409-aligned message, not silent 500", async ({ page }) => {
		const password = auth.E2E_PASSWORD;
		const email = uniqueEmail("dup", test.info().parallelIndex);
		const name = "E2E Dup";

		await page.goto("/signup");
		await auth.fillSignupForm(page, { name, email, password });
		await auth.submitSignup(page);
		await page.waitForURL(/\/login/, { timeout: 30_000 });

		await page.goto("/signup");
		await auth.fillSignupForm(page, { name: `${name} II`, email, password });
		await auth.submitSignup(page);

		await expect(page).toHaveURL(/\/signup/);
		await expect(page.getByText("An account with this email already exists")).toBeVisible({
			timeout: 15_000,
		});
	});

	test("login success: JWT in localStorage and redirect to home", async ({ page }) => {
		const password = auth.E2E_PASSWORD;
		const email = uniqueEmail("login", test.info().parallelIndex);
		const name = "E2E Login";

		await auth.registerThroughUi(page, { name, email, password });
		await auth.loginThroughUi(page, { email, password });

		await expect(page).toHaveURL(/\/$/);
		const token = await auth.getQuizmakerToken(page);
		expect(token).toBeTruthy();
		expect(token!.split(".").length).toBe(3);
		await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
	});

	test("bad password: error shown; no session token stored", async ({ page }) => {
		const password = auth.E2E_PASSWORD;
		const email = uniqueEmail("badpw", test.info().parallelIndex);
		const name = "E2E BadPw";

		await auth.registerThroughUi(page, { name, email, password });
		expect(await auth.getQuizmakerToken(page)).toBeNull();

		await page.goto("/login");
		await auth.fillLoginForm(page, { email, password: "Wrong_pass_99" });
		await auth.submitLogin(page);

		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByRole("alert")).toContainText(/invalid email or password/i);
		expect(await auth.getQuizmakerToken(page)).toBeNull();
	});

	test("/me with token: profile shows identity after login", async ({ page }) => {
		const password = auth.E2E_PASSWORD;
		const email = uniqueEmail("me", test.info().parallelIndex);
		const name = "E2E Me Page";

		await auth.registerAndLogin(page, { name, email, password });

		await page.goto("/me");
		await expect(page.getByRole("heading", { name: /profile/i })).toBeVisible();
		await expect(page.getByText(name)).toBeVisible();
		await expect(page.getByText(email)).toBeVisible();
	});

	test("logout: clears quizmaker_auth_token and lands on /signup", async ({ page }) => {
		const password = auth.E2E_PASSWORD;
		const email = uniqueEmail("logout", test.info().parallelIndex);
		const name = "E2E Logout";

		await auth.registerAndLogin(page, { name, email, password });
		expect(await auth.getQuizmakerToken(page)).toBeTruthy();

		await page.goto("/logout");
		await expect(page).toHaveURL(/\/signup/, { timeout: 30_000 });
		expect(await auth.getQuizmakerToken(page)).toBeNull();
	});
});
