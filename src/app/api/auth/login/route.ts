import { ZodError } from "zod";

import { jsonError, readJson } from "@/lib/api/http";
import { loginRequestSchema } from "@/lib/auth-contract";
import { verifyLoginCredentials } from "@/lib/auth/credentials";
import { signAccessToken } from "@/lib/auth/jwt";
import { getAuthJwtSecret, getWorkerEnv } from "@/lib/auth/worker-env";

/**
 * Phase C + D: Zod → `verifyLoginCredentials` → issue HS256 JWT (`docs/sprint-1/prd-auth-contract-env.mdc` §2.2).
 */
export async function POST(request: Request) {
	const raw = await readJson(request);
	if (raw === null) {
		return jsonError(400, "VALIDATION_ERROR", "Invalid JSON body");
	}

	let parsed;
	try {
		parsed = loginRequestSchema.parse(raw);
	} catch (e) {
		if (e instanceof ZodError) {
			const msg = e.issues[0]?.message ?? "Validation failed";
			return jsonError(400, "VALIDATION_ERROR", msg);
		}
		throw e;
	}

	const env = getWorkerEnv();
	const db = env.quizmaker_app_database;
	const secret = getAuthJwtSecret(env);
	if (!db) {
		return jsonError(500, "INTERNAL_ERROR", "Something went wrong");
	}

	if (typeof secret !== "string" || secret.length === 0) {
		return jsonError(500, "INTERNAL_ERROR", "Something went wrong");
	}

	const result = await verifyLoginCredentials(db, parsed.email, parsed.password);
	if (!result.ok) {
		return jsonError(401, "INVALID_CREDENTIALS", "Invalid email or password");
	}

	const { user } = result;
	const { token, expiresIn } = await signAccessToken(user.id, secret);

	return Response.json({
		token,
		tokenType: "Bearer" as const,
		expiresIn,
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
		},
	});
}
