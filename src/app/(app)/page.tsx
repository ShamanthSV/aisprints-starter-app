"use client";

import { useAuth } from "@/components/auth/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Phase D — authenticated home; user from `GET /api/me` bootstrap (`prd-auth-frontend.mdc`). */
export default function HomePage() {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	return (
		<div className="mx-auto max-w-2xl p-8">
			<Card>
				<CardHeader>
					<CardTitle>Welcome back</CardTitle>
					<CardDescription>You are signed in as {user.email}.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
					<p>
						<span className="font-medium text-zinc-900 dark:text-zinc-100">Name:</span> {user.name}
					</p>
					<p>
						<span className="font-medium text-zinc-900 dark:text-zinc-100">User ID:</span>{" "}
						<code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">{user.id}</code>
					</p>
					<p>
						<span className="font-medium text-zinc-900 dark:text-zinc-100">Member since:</span>{" "}
						{new Date(user.createdAt).toLocaleString()}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
