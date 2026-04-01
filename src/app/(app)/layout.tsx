import { AppAuthenticatedShell } from "@/components/auth/app-authenticated-shell";

/**
 * Phase C+D — `docs/sprint-1/prd-auth-frontend.mdc`: authenticated shell, client `/me` bootstrap (`AuthProvider`),
 * JWT in `quizmaker_auth_token` only (no RSC trust). Route group `(app)` is not part of URLs: `/`, `/me`, `/logout`.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
	return <AppAuthenticatedShell>{children}</AppAuthenticatedShell>;
}
