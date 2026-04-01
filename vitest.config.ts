import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** Colocated `*.test.ts` / `*.test.tsx` per `.cursor/rules/vitest-testing.mdc`. */
export default defineConfig({
	plugins: [react()],
	/** Avoid loading Tailwind v4 PostCSS via `postcss.config.mjs` inside Vitest’s Vite pipeline (plugin shape mismatch). */
	css: {
		postcss: {
			plugins: [],
		},
	},
	test: {
		environment: "jsdom",
		globals: false,
		setupFiles: ["./vitest.setup.ts"],
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
	},
	resolve: {
		alias: {
			"@": path.resolve(rootDir, "./src"),
		},
	},
});
