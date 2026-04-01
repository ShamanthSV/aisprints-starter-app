/** Augment generated Worker env with secrets set via Wrangler secrets / `.dev.vars` (not listed in wrangler.jsonc). */
declare namespace Cloudflare {
	interface Env {
		AUTH_JWT_SECRET: string;
	}
}
