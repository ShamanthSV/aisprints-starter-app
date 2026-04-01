import { getCloudflareContext } from "@opennextjs/cloudflare";

/** D1 binding, JWT secret, and other Worker env — prefer over `process.env` alone in API routes. */
export function getWorkerEnv(): Cloudflare.Env {
	const { env } = getCloudflareContext();
	return env;
}

/**
 * HS256 signing/verify secret: prefer Worker `env` (Wrangler / `.dev.vars`), then `process.env`
 * so local Next (e.g. `.env.local`) and Cloudflare stay aligned.
 */
export function getAuthJwtSecret(env: Cloudflare.Env): string | undefined {
	const fromWorker = env.AUTH_JWT_SECRET;
	if (typeof fromWorker === "string" && fromWorker.length > 0) {
		return fromWorker;
	}
	const fromProcess = process.env.AUTH_JWT_SECRET;
	if (typeof fromProcess === "string" && fromProcess.length > 0) {
		return fromProcess;
	}
	return undefined;
}
