import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";

/** Phase B — `docs/sprint-1/prd-auth-frontend.mdc`: react-hook-form + Zod + shadcn; `POST /api/auth/signup`. */
export default function SignupPage() {
	return (
		<div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create an account</CardTitle>
					<CardDescription>
						Sign up with your name, email, and password. After registration you&apos;ll go to the login page
						to sign in.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SignupForm />
				</CardContent>
			</Card>
		</div>
	);
}
