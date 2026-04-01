import type { D1Database, D1Result } from "@cloudflare/workers-types";

/**
 * Normalize anonymous `?` placeholders to `?1`, `?2`, … for D1 prepared statements.
 */
export function normalizeSqlPlaceholders(sql: string): string {
	let n = 0;
	return sql.replace(/\?(?!\d)/g, () => `?${++n}`);
}

export async function executeQuery<T>(
	db: D1Database,
	sql: string,
	binds: unknown[] = [],
): Promise<T[]> {
	const normalized = normalizeSqlPlaceholders(sql);
	const stmt = db.prepare(normalized);
	const bound = binds.length > 0 ? stmt.bind(...binds) : stmt;
	const { results } = await bound.all<T>();
	return results ?? [];
}

export async function executeQueryFirst<T>(
	db: D1Database,
	sql: string,
	binds: unknown[] = [],
): Promise<T | null> {
	const rows = await executeQuery<T>(db, sql, binds);
	return rows[0] ?? null;
}

export async function executeMutation(
	db: D1Database,
	sql: string,
	binds: unknown[] = [],
): Promise<D1Result> {
	const normalized = normalizeSqlPlaceholders(sql);
	const stmt = db.prepare(normalized);
	const bound = binds.length > 0 ? stmt.bind(...binds) : stmt;
	return bound.run();
}
