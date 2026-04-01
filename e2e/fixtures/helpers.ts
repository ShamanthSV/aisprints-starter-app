import type { Page } from "@playwright/test";

/** Same default as `playwright.config.ts` / `docs/sprint-1/prd-auth-e2e.mdc`. */
export function getBaseURL(): string {
	return process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
}

/**
 * Globally unique per call — includes `parallelIndex` from `test.info().parallelIndex` when tests run in parallel (`prd-auth-e2e.mdc`).
 */
export function uniqueEmail(prefix = "e2e", parallelIndex = 0): string {
	return `${prefix}-w${parallelIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}@example.com`;
}

/** Clears cookies and web storage (use before auth scenarios in Phase B). */
export async function clearStorage(page: Page): Promise<void> {
	await page.context().clearCookies();
	await page.evaluate(() => {
		try {
			localStorage.clear();
			sessionStorage.clear();
		} catch {
			// ignore
		}
	});
}
