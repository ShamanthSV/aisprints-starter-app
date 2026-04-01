import * as jose from "jose";
import { ACCESS_TOKEN_EXPIRES_SEC } from "@/lib/auth-contract";
import { getAuthJwtSecret } from "@/lib/auth/worker-env";

/** Phase C — HS256, `sub` / `iat` / `exp`; secret from Worker env only at call sites that have validated `env`. */
export async function signAccessToken(
	userId: string,
	secret: string,
): Promise<{ token: string; expiresIn: number }> {
	const key = new TextEncoder().encode(secret);
	const now = Math.floor(Date.now() / 1000);
	const exp = now + ACCESS_TOKEN_EXPIRES_SEC;
	const token = await new jose.SignJWT({})
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(userId)
		.setIssuedAt(now)
		.setExpirationTime(exp)
		.sign(key);
	return { token, expiresIn: exp - now };
}

export async function verifyAccessToken(
	token: string,
	secret: string,
): Promise<jose.JWTPayload & { sub: string }> {
	const key = new TextEncoder().encode(secret);
	const { payload } = await jose.jwtVerify(token, key, {
		algorithms: ["HS256"],
		clockTolerance: "60s",
	});
	if (typeof payload.sub !== "string" || payload.sub.length === 0) {
		throw new Error("INVALID_TOKEN_SUB");
	}
	return payload as jose.JWTPayload & { sub: string };
}

/**
 * Verify a Bearer JWT using **`AUTH_JWT_SECRET`** (Worker env + `process.env` via **`getAuthJwtSecret`**).
 * Rejects `alg=none` via **jose**; **`exp`** validated with ±60s leeway.
 */
export async function verifyAccessTokenFromEnv(
	token: string,
	env: Cloudflare.Env,
): Promise<jose.JWTPayload & { sub: string }> {
	const secret = getAuthJwtSecret(env);
	if (typeof secret !== "string" || secret.length === 0) {
		throw new Error("AUTH_JWT_SECRET_MISSING");
	}
	return verifyAccessToken(token, secret);
}
