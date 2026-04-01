import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * `docs/sprint-1/prd-auth-frontend.mdc`: matchers for HTML app routes. Route groups are **not** in URLs:
 * - `(auth)` → `/login`, `/signup` — public shell.
 * - `(app)` → `/`, `/me`, `/logout` — app shell; JWT lives in `localStorage` (`quizmaker_auth_token`); **client** bootstrap + guards (`AuthProvider`), not Edge JWT verify.
 *
 * Pass-through for Sprint 1 — no cookie session; optional cookie bridge would amend this file later.
 * Exclude API and static assets from matchers so API routes are not wrapped unnecessarily.
 */
export function middleware(_request: NextRequest) {
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * HTML app routes only (Phase A skeleton). Adjust when adding protected prefixes or `/_next` exclusions.
		 * Not matched: `/api/*` (Next default), static files under `public/`.
		 */
		"/",
		"/login",
		"/signup",
		"/me",
		"/logout",
	],
};
