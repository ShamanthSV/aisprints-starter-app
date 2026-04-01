import { jsonError } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkerEnv } from "@/lib/auth/worker-env";
import { findUserById, rowToPublic } from "@/lib/auth/users-repository";

/** Phase D — GET /api/me; resolve JWT sub to user via findUserById (executeQueryFirst). */
export async function GET(request: Request) {
	const auth = await requireUser(request);
	if (!auth.ok) {
		return auth.response;
	}

	const env = getWorkerEnv();
	const db = env.quizmaker_app_database;
	if (!db) {
		return jsonError(500, "INTERNAL_ERROR", "Something went wrong");
	}

	const row = await findUserById(db, auth.userId);
	if (!row) {
		return jsonError(401, "UNAUTHORIZED", "Invalid or expired token");
	}

	return Response.json({ user: rowToPublic(row) });
}
