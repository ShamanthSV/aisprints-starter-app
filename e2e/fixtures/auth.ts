import { expect, type Page } from "@playwright/test";

/**
 * Must match `src/lib/auth-contract.ts` (`QUIZMAKER_AUTH_TOKEN_STORAGE_KEY`).
 * Keep in sync when renaming the client storage key.
 */
export const QUIZMAKER_AUTH_TOKEN_KEY = "quizmaker_auth_token" as const;

/** Meets API `password` min length; do not log in traces beyond what Playwright records for field fills. */
export const E2E_PASSWORD = "E2e_pass_99";

export async function getQuizmakerToken(page: Page): Promise<string | null> {
	return page.evaluate((key) => localStorage.getItem(key), QUIZMAKER_AUTH_TOKEN_KEY);
}

export async function fillSignupForm(
	page: Page,
	opts: { name: string; email: string; password: string },
): Promise<void> {
	await page.getByLabel("Name").fill(opts.name);
	await page.getByLabel("Email").fill(opts.email);
	await page.getByLabel("Password", { exact: true }).fill(opts.password);
	await page.getByLabel("Confirm password").fill(opts.password);
}

export async function fillLoginForm(page: Page, opts: { email: string; password: string }): Promise<void> {
	await page.getByLabel("Email").fill(opts.email);
	await page.getByLabel("Password").fill(opts.password);
}

export async function submitSignup(page: Page): Promise<void> {
	await page.getByRole("button", { name: /create account/i }).click();
}

export async function submitLogin(page: Page): Promise<void> {
	await page.getByRole("button", { name: /^log in$/i }).click();
}

export async function registerThroughUi(
	page: Page,
	opts: { name: string; email: string; password: string },
): Promise<void> {
	await page.goto("/signup");
	await fillSignupForm(page, opts);
	await submitSignup(page);
	await page.waitForURL(/\/login/, { timeout: 30_000 });
}

export async function loginThroughUi(page: Page, opts: { email: string; password: string }): Promise<void> {
	await page.goto("/login");
	await fillLoginForm(page, opts);
	await submitLogin(page);
	await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible({ timeout: 30_000 });
}

export async function registerAndLogin(
	page: Page,
	opts: { name: string; email: string; password: string },
): Promise<void> {
	await registerThroughUi(page, opts);
	await loginThroughUi(page, { email: opts.email, password: opts.password });
}
