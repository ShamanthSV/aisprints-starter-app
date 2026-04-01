"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { setToken } from "@/lib/auth-token";
import { AuthApiError, signup } from "@/lib/services/auth-service";
import { signupFormSchema, type SignupFormValues } from "@/lib/validation/signup-schema";

export function SignupForm() {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<SignupFormValues>({
		resolver: zodResolver(signupFormSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		setFormError(null);
		form.clearErrors("email");
		try {
			const data = await signup({
				name: values.name.trim(),
				email: values.email,
				password: values.password,
			});

			if (data.token) {
				setToken(data.token);
				router.replace("/");
				return;
			}

			router.replace("/login?registered=1");
		} catch (e) {
			if (e instanceof AuthApiError) {
				if (e.isCode("EMAIL_ALREADY_EXISTS")) {
					form.setError("email", { message: e.message });
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
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input autoComplete="name" placeholder="Your name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
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
								<Input type="password" autoComplete="new-password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm password</FormLabel>
							<FormControl>
								<Input type="password" autoComplete="new-password" {...field} />
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
					{form.formState.isSubmitting ? "Creating account…" : "Create account"}
				</Button>
				<p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
					Already have an account?{" "}
					<Link href="/login" className="underline underline-offset-4">
						Log in
					</Link>
				</p>
			</form>
		</Form>
	);
}
