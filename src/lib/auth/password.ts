/**
 * Pure-JS bcrypt for Cloudflare Workers + `nodejs_compat` (no native addons). Hash at rest only.
 * @see docs/sprint-1/prd-auth-backend.mdc Phase B
 */
import bcrypt from "bcryptjs";

const ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
	return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
	return bcrypt.compare(plain, hash);
}
