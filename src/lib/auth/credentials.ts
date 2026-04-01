import type { D1Database } from "@cloudflare/workers-types";

import { verifyPassword } from "@/lib/auth/password";
import { findUserByEmail, type UserRow } from "@/lib/auth/users-repository";

/**
 * Validates email/password against D1 using `executeQueryFirst` + bcrypt `compare` only (Phase B).
 * Same failure shape for unknown email vs bad password (no user enumeration in return value).
 */
export async function verifyLoginCredentials(
	db: D1Database,
	email: string,
	plainPassword: string,
): Promise<{ ok: true; user: UserRow } | { ok: false }> {
	const user = await findUserByEmail(db, email);
	if (!user) {
		return { ok: false };
	}
	const match = await verifyPassword(plainPassword, user.password_hash);
	if (!match) {
		return { ok: false };
	}
	return { ok: true, user };
}
