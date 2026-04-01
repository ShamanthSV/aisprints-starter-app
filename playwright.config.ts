import { defineConfig, devices } from "@playwright/test";

/**
 * `docs/sprint-1/prd-auth-e2e.mdc` — `baseURL` from env (default `http://127.0.0.1:3000` for `next dev`).
 * Phase C: same-origin `request` + `page` share this origin; preview runs need `PLAYWRIGHT_BASE_URL` + `PLAYWRIGHT_SKIP_WEBSERVER=1`.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
		? undefined
		: {
				command: "npm run dev",
				url: baseURL,
				reuseExistingServer: !process.env.CI,
				timeout: 120_000,
			},
});
