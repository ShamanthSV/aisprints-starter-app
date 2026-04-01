# E2E tests (Playwright)

Normative PRD: [`docs/sprint-1/prd-auth-e2e.mdc`](../docs/sprint-1/prd-auth-e2e.mdc).

## Prerequisites

- Node.js and npm dependencies installed (`npm install`).
- Browsers: `npm run test:e2e:install` (or `npx playwright install --with-deps` on Linux CI).

## Environment

| Variable | Purpose | Default |
|----------|---------|---------|
| `PLAYWRIGHT_BASE_URL` | App origin for `page.goto` / `baseURL` | `http://127.0.0.1:3000` |
| `PLAYWRIGHT_SKIP_WEBSERVER` | Set to `1` to **not** spawn `npm run dev` (use when you already started the app) | unset |
| `CI` | Set by CI; enables retries, HTML report, `forbidOnly` | unset locally |

See [`.env.test.example`](../.env.test.example) for copy-paste placeholders. Playwright does not load `.env` files unless you add a loader; export variables in your shell or define them in the pipeline.

## Running tests (local)

**Canonical one-liner** (starts Next via `playwright.config.ts` `webServer`, then runs specs):

```bash
npm run test:e2e
```

If the dev server is already running on the same URL:

```bash
set PLAYWRIGHT_SKIP_WEBSERVER=1
set PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
npm run test:e2e
```

(Debug UI: `npm run test:e2e:ui`.)

## CI (headless)

- Install browsers: `npm run test:e2e:install` (Linux: `--with-deps` installs OS deps).
- Run: `npm run test:e2e` with `CI=true` so the config runs headless-friendly settings and starts `npm run dev` automatically unless `PLAYWRIGHT_SKIP_WEBSERVER=1`.

GitHub Actions example: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Local D1 / data cleanup

Auth flows (Phase B) need a working app + database. For **local** D1:

- Apply migrations per `AGENTS.md` / `wrangler d1 migrations apply --local`.
- Between runs, prefer **unique emails** (`e2e/fixtures/helpers.ts` → `uniqueEmail()`), or reset the local DB using Wrangler against **local** only — never point cleanup scripts at production.

Exact reset commands depend on your machine’s `.wrangler` state; document any team-standard `wrangler d1 execute --local --file=...` script here when added.

## E2E: local vs preview

Run Playwright against whichever stack serves the Next app + `/api/*` routes. The **`request`** fixture and `page` both resolve **`baseURL`** from `PLAYWRIGHT_BASE_URL` (see `playwright.config.ts`), so UI and API calls stay **same-origin** — relative paths like `/api/me` match the app (`docs/sprint-1/prd-auth-e2e.mdc` Phase C). You do **not** need a separate API host unless the product later uses an absolute public API URL (`NEXT_PUBLIC_*`); then set `PLAYWRIGHT_BASE_URL` to the same origin the browser would use.

| Target | Command | Typical URL | E2E setup |
|--------|---------|-------------|-----------|
| **Next dev (default)** | `npm run dev` | `http://127.0.0.1:3000` | Leave `PLAYWRIGHT_BASE_URL` unset or set to that origin. `playwright.config.ts` starts this server unless `PLAYWRIGHT_SKIP_WEBSERVER=1`. |
| **OpenNext Cloudflare preview** | `npm run preview` | **Port printed in the terminal** (not always `3000`) | Run preview, copy the origin (e.g. `http://127.0.0.1:8788`), then `set PLAYWRIGHT_BASE_URL=...` and `set PLAYWRIGHT_SKIP_WEBSERVER=1`, and run `npm run test:e2e`. |

**CORS:** Sprint 1 UI calls `/api/...` with same-origin `fetch`. E2E therefore uses one `baseURL` for both navigation and `request.get('/api/...')`. Cross-origin API calls are out of scope unless introduced later; if they are, align `PLAYWRIGHT_BASE_URL` and any `NEXT_PUBLIC_*` API base with the preview/dev origin.

**Phase C** (`e2e/config.spec.ts`): asserts unreachable/wrong origins fail loudly, `/api/me` without auth returns contract **401** JSON, and Vitest covers `auth-fetch` header behavior (`src/lib/auth-fetch.test.ts`).

## Phase A / B / C

- **Phase A:** smoke (`e2e/smoke.spec.ts`).
- **Phase B:** `e2e/auth.spec.ts` — signup, duplicate email, login, bad password, `/me` (UI), logout → `/signup`. Helpers: `e2e/fixtures/auth.ts`, `e2e/fixtures/helpers.ts`.
- **Phase C:** `e2e/config.spec.ts` — wrong-origin failures, `/api/me` **401** contract via `request`, unreachable-origin navigation timeout; plus `src/lib/auth-fetch.test.ts` (Vitest).

**Requirements:** App must serve auth APIs with local **D1** migrated and **`AUTH_JWT_SECRET`** set (e.g. `.dev.vars` for `npm run dev`). Without DB, signup/login tests will fail.

## Troubleshooting

- **`Cannot find module 'next/dist/compiled/commander'`** (or similar) when the web server starts: the Next.js install is incomplete or corrupted. Delete `node_modules`, reinstall with `npm install`, and retry. CI (clean `npm ci`) should not hit this.
- **`playwright.config.ts` webServer** runs `npm run dev` by default. Use `PLAYWRIGHT_SKIP_WEBSERVER=1` if you start the app yourself on `PLAYWRIGHT_BASE_URL`.
