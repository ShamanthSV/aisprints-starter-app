import type { D1Database } from "@cloudflare/workers-types";

import { executeMutation, executeQueryFirst } from "../../../lib/d1-client";
import type { UserPublic } from "@/lib/auth-contract";

export type UserRow = {
	id: string;
	email: string;
	password_hash: string;
	name: string;
	created_at: string;
	updated_at: string;
};

export function rowToPublic(row: UserRow): UserPublic {
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		createdAt: row.created_at,
	};
}

export async function findUserByEmail(
	db: D1Database,
	email: string,
): Promise<UserRow | null> {
	const normalized = email.trim().toLowerCase();
	return executeQueryFirst<UserRow>(
		db,
		`SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE email = ?1`,
		[normalized],
	);
}

export async function findUserById(db: D1Database, id: string): Promise<UserRow | null> {
	return executeQueryFirst<UserRow>(
		db,
		`SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE id = ?1`,
		[id],
	);
}

export async function insertUser(
	db: D1Database,
	row: {
		id: string;
		email: string;
		password_hash: string;
		name: string;
		created_at: string;
		updated_at: string;
	},
): Promise<{ ok: true } | { ok: false; duplicateEmail: boolean }> {
	const result = await executeMutation(
		db,
		`INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
		[
			row.id,
			row.email,
			row.password_hash,
			row.name,
			row.created_at,
			row.updated_at,
		],
	);
	if (result.success) {
		return { ok: true };
	}
	const msg = result.error ?? "";
	if (msg.includes("UNIQUE") || msg.toLowerCase().includes("unique")) {
		return { ok: false, duplicateEmail: true };
	}
	return { ok: false, duplicateEmail: false };
}
