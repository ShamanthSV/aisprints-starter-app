"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

import { AuthProvider, useAuth } from "./auth-context";

function AppChrome({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { user, loading, bootstrapped } = useAuth();

	const onLogoutRoute = pathname === "/logout";
	const showGate =
		!onLogoutRoute && bootstrapped && !user;

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
				<p>Loading…</p>
			</div>
		);
	}

	if (showGate) {
		return null;
	}

	return (
		<div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
			<header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
				<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
					<Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-100">
						QuizMaker
					</Link>
					<div className="flex items-center gap-3">
						{user ? (
							<span className="hidden max-w-[12rem] truncate text-sm text-zinc-600 sm:inline dark:text-zinc-400">
								{user.name}
							</span>
						) : null}
						<nav className="flex items-center gap-2" aria-label="App navigation">
							{user ? (
								<Button variant="ghost" size="sm" asChild>
									<Link href="/me">Profile</Link>
								</Button>
							) : null}
							<Button variant="ghost" size="sm" asChild>
								<Link href="/logout">Log out</Link>
							</Button>
						</nav>
					</div>
				</div>
			</header>
			<main className="flex-1">{children}</main>
		</div>
	);
}

/**
 * Phase D — authenticated shell: `/me` bootstrap via `AuthProvider`, chrome + `GET /api/me` user in header.
 */
export function AppAuthenticatedShell({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<AppChrome>{children}</AppChrome>
		</AuthProvider>
	);
}
