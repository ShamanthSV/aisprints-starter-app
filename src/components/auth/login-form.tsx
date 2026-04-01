"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getToken, setToken } from "@/lib/auth-token";
import { AuthApiError, login } from "@/lib/services/auth-service";
import { loginFormSchema, type LoginFormValues } from "@/lib/validation/login-schema";

type LoginFormProps = {
	/** After signup redirect (`?registered=1`). */
	registeredHint?: boolean;
};

export function LoginForm({ registeredHint }: LoginFormProps) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	useEffect(() => {
		if (getToken()) {
			router.replace("/");
		}
	}, [router]);

	const onSubmit = form.handleSubmit(async (values) => {
		setFormError(null);
		try {
			const data = await login({
				email: values.email,
				password: values.password,
			});
			setToken(data.token);
			router.replace("/");
		} catch (e) {
			if (e instanceof AuthApiError) {
				if (e.status === 401 || e.isCode("INVALID_CREDENTIALS")) {
					setFormError(e.message);
					return;
				}
				if (e.isCode("VALIDATION_ERROR") && e.status === 400) {
					setFormError(e.message);
					return;
				}
				setFormError(e.message);
				return;
			}
			setFormError("Something went wrong. Please try again.");
		}
	});

	return (
		<Form {...form}>
			<form onSubmit={onSubmit} className="space-y-4" noValidate>
				{registeredHint ? (
					<p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
						Account created. Sign in with your email and password.
					</p>
				) : null}
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" autoComplete="email" placeholder="you@school.edu" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input type="password" autoComplete="current-password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{formError ? (
					<p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
						{formError}
					</p>
				) : null}
				<Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Signing in…" : "Log in"}
				</Button>
				<p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
					No account?{" "}
					<Link href="/signup" className="underline underline-offset-4">
						Sign up
					</Link>
				</p>
			</form>
		</Form>
	);
}
