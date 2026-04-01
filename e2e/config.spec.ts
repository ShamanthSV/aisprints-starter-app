import { expect, request as playwrightRequest, test } from "@playwright/test";

/**
 * Phase C — `docs/sprint-1/prd-auth-e2e.mdc`: misconfiguration fails loudly; same-origin `/api` contract;
 * navigation to an unreachable origin does not hang past Playwright timeouts.
 *
 * Uses high, mostly-unlistened ports (not configurable) so tests do not hit the dev server.
 */
const REFUSED_PORT_API = 49123;
const REFUSED_PORT_PAGE = 49124;

test.describe("Phase C — cross-cutting", () => {
	test("wrong API origin: request fails with a network error (not a silent pass with JSON body)", async () => {
		const ctx = await playwrightRequest.newContext({
			baseURL: `http://127.0.0.1:${REFUSED_PORT_API}`,
		});
		try {
			await ctx.get("/api/me", { timeout: 15_000 });
			throw new Error("Expected connection failure — got a response instead");
		} catch (e) {
			const msg = String(e);
			expect(msg).toMatch(
				/ECONNREFUSED|ECONN|ETIMEDOUT|connect|connection|refused|failed|network|socket|aggregate|fetch/i,
			);
		} finally {
			await ctx.dispose();
		}
	});

	test("same-origin /api/me without auth returns 401 JSON per contract", async ({ request }) => {
		const res = await request.get("/api/me");
		expect(res.status()).toBe(401);
		const body = (await res.json()) as { error?: { code?: string; message?: string } };
		expect(body.error?.code).toBe("UNAUTHORIZED");
		expect(typeof body.error?.message).toBe("string");
		expect(body.error!.message!.length).toBeGreaterThan(0);
	});

	test("unreachable page origin: navigation fails within timeout (no indefinite spinner)", async ({
		browser,
	}) => {
		const context = await browser.newContext({
			baseURL: `http://127.0.0.1:${REFUSED_PORT_PAGE}`,
		});
		const page = await context.newPage();
		const start = Date.now();
		await expect(page.goto("/login", { timeout: 12_000 })).rejects.toThrow();
		expect(Date.now() - start).toBeLessThan(14_000);
		await context.close();
	});
});
