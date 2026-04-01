import { jsonError } from "@/lib/api/http";
import { verifyAccessTokenFromEnv } from "@/lib/auth/jwt";
import { getWorkerEnv } from "@/lib/auth/worker-env";

/**
 * Resolve authenticated user id from JWT **`sub`** (`Authorization: Bearer <jwt>`).
 * Phase D placeholder for ownership checks (`created_by` === `userId`). Contract: **401** + `UNAUTHORIZED` on failure.
 */
export async function requireUserId(request: Request): Promise<
	| { ok: true; userId: string }
	| { ok: false; response: Response }
> {
	const auth = request.headers.get("authorization");
	if (!auth?.toLowerCase().startsWith("bearer ")) {
		return {
			ok: false,
			response: jsonError(401, "UNAUTHORIZED", "Authentication required"),
		};
	}
	const token = auth.slice(7).trim();
	if (!token) {
		return {
			ok: false,
			response: jsonError(401, "UNAUTHORIZED", "Authentication required"),
		};
	}
	const env = getWorkerEnv();
	try {
		const payload = await verifyAccessTokenFromEnv(token, env);
		return { ok: true, userId: payload.sub };
	} catch (e) {
		if (e instanceof Error && e.message === "AUTH_JWT_SECRET_MISSING") {
			return {
				ok: false,
				response: jsonError(500, "INTERNAL_ERROR", "Something went wrong"),
			};
		}
		return {
			ok: false,
			response: jsonError(401, "UNAUTHORIZED", "Invalid or expired token"),
		};
	}
}

/** Alias matching PRD naming (`requireUser` → `{ userId }` from JWT **`sub`**). */
export const requireUser = requireUserId;
