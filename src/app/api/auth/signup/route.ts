import { ZodError } from "zod";

import { jsonError, readJson } from "@/lib/api/http";
import { signupRequestSchema } from "@/lib/auth-contract";
import { hashPassword } from "@/lib/auth/password";
import { getWorkerEnv } from "@/lib/auth/worker-env";
import { insertUser } from "@/lib/auth/users-repository";

export async function POST(request: Request) {
	const raw = await readJson(request);
	if (raw === null) {
		return jsonError(400, "VALIDATION_ERROR", "Invalid JSON body");
	}

	let parsed;
	try {
		parsed = signupRequestSchema.parse(raw);
	} catch (e) {
		if (e instanceof ZodError) {
			const msg = e.issues[0]?.message ?? "Validation failed";
			return jsonError(400, "VALIDATION_ERROR", msg);
		}
		throw e;
	}

	const env = getWorkerEnv();
	const db = env.quizmaker_app_database;
	if (!db) {
		return jsonError(500, "INTERNAL_ERROR", "Something went wrong");
	}

	const id = crypto.randomUUID();
	const now = new Date().toISOString();
	const email = parsed.email;
	const password_hash = await hashPassword(parsed.password);
	const name = parsed.name.trim();

	const result = await insertUser(db, {
		id,
		email,
		password_hash,
		name,
		created_at: now,
		updated_at: now,
	});

	if (!result.ok) {
		if (result.duplicateEmail) {
			return jsonError(
				409,
				"EMAIL_ALREADY_EXISTS",
				"An account with this email already exists",
			);
		}
		return jsonError(500, "INTERNAL_ERROR", "Something went wrong");
	}

	return Response.json(
		{
			user: {
				id,
				email,
				name,
				createdAt: now,
			},
		},
		{ status: 201 },
	);
}
