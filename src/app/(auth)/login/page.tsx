import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Phase C — `POST /api/auth/login`, persist JWT (`quizmaker_auth_token`), redirect home (`prd-auth-frontend.mdc`). */
export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ registered?: string }>;
}) {
	const sp = await searchParams;

	return (
		<div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Log in</CardTitle>
					<CardDescription>Enter your email and password to continue to QuizMaker.</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm registeredHint={sp.registered === "1"} />
				</CardContent>
			</Card>
		</div>
	);
}
