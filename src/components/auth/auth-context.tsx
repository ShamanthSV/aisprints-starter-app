"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { clearToken, getToken } from "@/lib/auth-token";
import { AuthApiError, fetchMe } from "@/lib/services/auth-service";

export type AuthUser = {
	id: string;
	email: string;
	name: string;
	createdAt: string;
};

type BootstrapState = { phase: "loading" } | { phase: "done"; user: AuthUser | null };

type AuthContextValue = {
	user: AuthUser | null;
	/** True while resolving `GET /api/me` (skipped on `/logout`). */
	loading: boolean;
	/** Bootstrap finished; if `user` is null and route is not `/logout`, UI should show nothing (redirect to login). */
	bootstrapped: boolean;
	refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within AppAuthenticatedShell");
	}
	return ctx;
}

/**
 * Phase D — `docs/sprint-1/prd-auth-frontend.mdc`: client bootstrap with `GET /api/me` when `quizmaker_auth_token` exists.
 * `/logout` skips `/me` so the logout page can clear storage and redirect (`prd-auth-contract-env.mdc` §2.4).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const [bootstrap, setBootstrap] = useState<BootstrapState>({ phase: "loading" });

	const refresh = useCallback(async () => {
		const token = getToken();
		if (!token) {
			setBootstrap({ phase: "done", user: null });
			router.replace("/login");
			return;
		}
		try {
			const { user } = await fetchMe(token);
			setBootstrap({ phase: "done", user });
		} catch (e) {
			if (e instanceof AuthApiError && e.status === 401) {
				clearToken();
			}
			setBootstrap({ phase: "done", user: null });
			router.replace("/login");
		}
	}, [router]);

	useEffect(() => {
		if (pathname === "/logout") {
			setBootstrap({ phase: "done", user: null });
			return;
		}

		const token = getToken();
		if (!token) {
			router.replace("/login");
			setBootstrap({ phase: "done", user: null });
			return;
		}

		let cancelled = false;
		setBootstrap({ phase: "loading" });

		fetchMe(token)
			.then(({ user }) => {
				if (!cancelled) setBootstrap({ phase: "done", user });
			})
			.catch((e) => {
				if (cancelled) return;
				if (e instanceof AuthApiError && e.status === 401) {
					clearToken();
				}
				router.replace("/login");
				setBootstrap({ phase: "done", user: null });
			});

		return () => {
			cancelled = true;
		};
	}, [pathname, router]);

	const value = useMemo((): AuthContextValue => {
		const onLogoutRoute = pathname === "/logout";
		const loading = bootstrap.phase === "loading" && !onLogoutRoute;
		const bootstrapped = bootstrap.phase === "done";
		const user = bootstrap.phase === "done" ? bootstrap.user : null;
		return {
			user,
			loading,
			bootstrapped,
			refresh,
		};
	}, [bootstrap, pathname, refresh]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
