"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { clearToken } from "@/lib/auth-token";
import { logoutRequest } from "@/lib/services/auth-service";

/**
 * Phase D — clear `quizmaker_auth_token`, optional `POST /api/auth/logout`, then redirect per product (`/signup`).
 * `docs/sprint-1/prd-auth-contract-env.mdc` §2.4: server ack only; session is client-side.
 */
export default function LogoutPage() {
	const router = useRouter();

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			await logoutRequest().catch(() => {});
			clearToken();
			if (!cancelled) {
				router.replace("/signup");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [router]);

	return (
		<div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
			<p className="text-sm text-zinc-600 dark:text-zinc-400">Signing you out…</p>
		</div>
	);
}
