import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Unauthenticated shell (Phase A — `docs/sprint-1/prd-auth-frontend.mdc`).
 * URLs: `/login`, `/signup` (route group folder `(auth)` is not part of the path).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
			<header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
				<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
					<Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-100">
						QuizMaker
					</Link>
					<nav className="flex items-center gap-2" aria-label="Auth navigation">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/login">Log in</Link>
						</Button>
						<Button size="sm" asChild>
							<Link href="/signup">Sign up</Link>
						</Button>
					</nav>
				</div>
			</header>
			<main className="flex-1">{children}</main>
			<footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
				Sprint 1 — Phase A auth shell. Full forms and token handling follow later phases.
			</footer>
		</div>
	);
}
