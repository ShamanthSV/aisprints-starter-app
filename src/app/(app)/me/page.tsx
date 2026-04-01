"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Phase D — profile view backed by same `/me` bootstrap as the rest of the app shell. */
export default function MePage() {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	return (
		<div className="mx-auto max-w-lg p-8">
			<Card>
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>Account details from the server (`GET /api/me`).</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<dl className="space-y-2 text-sm">
						<div>
							<dt className="font-medium text-zinc-500 dark:text-zinc-400">Name</dt>
							<dd className="text-zinc-900 dark:text-zinc-100">{user.name}</dd>
						</div>
						<div>
							<dt className="font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
							<dd className="text-zinc-900 dark:text-zinc-100">{user.email}</dd>
						</div>
						<div>
							<dt className="font-medium text-zinc-500 dark:text-zinc-400">Account ID</dt>
							<dd>
								<code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">{user.id}</code>
							</dd>
						</div>
						<div>
							<dt className="font-medium text-zinc-500 dark:text-zinc-400">Created</dt>
							<dd className="text-zinc-900 dark:text-zinc-100">
								{new Date(user.createdAt).toLocaleString()}
							</dd>
						</div>
					</dl>
					<Button variant="outline" asChild>
						<Link href="/">Back to home</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
