#!/usr/bin/env node
/**
 * Cloudflare D1: ensure `quizmaker-app-database` exists, sync `database_id` in wrangler.jsonc,
 * apply migrations to the remote DB. Requires `wrangler login` or CLOUDFLARE_API_TOKEN.
 *
 * Optional env:
 *   D1_LOCATION   — hint for new DB: weur | eeur | apac | oc | wnam | enam
 *   D1_SKIP_MIGRATE — set to 1 to skip `d1 migrations apply --remote`
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const WRANGLER_CLI = join(root, "node_modules", "wrangler", "wrangler-dist", "cli.js");

const DATABASE_NAME = "quizmaker-app-database";

function wrangler(args) {
	return execFileSync(
		process.execPath,
		["--no-warnings", "--experimental-vm-modules", WRANGLER_CLI, ...args],
		{
			cwd: root,
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
			env: process.env,
		},
	);
}

function listDatabases() {
	const out = wrangler(["d1", "list", "--json"]).trim();
	const parsed = JSON.parse(out);
	return Array.isArray(parsed) ? parsed : [];
}

function findDb(dbs, name) {
	return dbs.find((d) => d && d.name === name) ?? null;
}

function getUuid(db) {
	if (!db) return null;
	return typeof db.uuid === "string" ? db.uuid : null;
}

function ensureDatabase() {
	let dbs = listDatabases();
	let row = findDb(dbs, DATABASE_NAME);
	if (row) {
		console.log(`D1 database "${DATABASE_NAME}" already exists.`);
		return getUuid(row);
	}

	console.log(`Creating D1 database "${DATABASE_NAME}"…`);
	const createArgs = ["d1", "create", DATABASE_NAME];
	const loc = process.env.D1_LOCATION;
	if (loc) {
		createArgs.push("--location", loc);
	}
	try {
		wrangler(createArgs);
	} catch (e) {
		const stderr =
			e && typeof e === "object" && "stderr" in e && e.stderr
				? Buffer.isBuffer(e.stderr)
					? e.stderr.toString("utf8")
					: String(e.stderr)
				: "";
		const msg = e instanceof Error ? e.message : String(e);
		const combined = `${msg}\n${stderr}`;
		if (combined.includes("already exists") || combined.includes("7502")) {
			console.log("Database already present on account; refreshing list…");
		} else {
			throw e;
		}
	}

	dbs = listDatabases();
	row = findDb(dbs, DATABASE_NAME);
	const uuid = getUuid(row);
	if (!uuid) {
		throw new Error(
			`Could not resolve uuid for "${DATABASE_NAME}" after create. Check wrangler auth and D1 API access.`,
		);
	}
	return uuid;
}

function patchWranglerJsonc(uuid) {
	const path = join(root, "wrangler.jsonc");
	let text = readFileSync(path, "utf8");
	const next = text.replace(
		/("database_id"\s*:\s*")([0-9a-f-]+)(")/i,
		`$1${uuid}$3`,
	);
	if (next === text) {
		throw new Error(
			`Could not find database_id to replace in wrangler.jsonc. Add "database_id": "${uuid}" under d1_databases manually.`,
		);
	}
	writeFileSync(path, next, "utf8");
	console.log(`Updated wrangler.jsonc with database_id ${uuid}.`);
}

function applyMigrationsRemote() {
	console.log(`Applying migrations to remote "${DATABASE_NAME}"…`);
	wrangler(["d1", "migrations", "apply", DATABASE_NAME, "--remote"]);
	console.log("Migrations applied.");
}

function main() {
	const uuid = ensureDatabase();
	patchWranglerJsonc(uuid);
	if (process.env.D1_SKIP_MIGRATE === "1") {
		console.log("D1_SKIP_MIGRATE=1 — skipping remote migrations.");
		return;
	}
	applyMigrationsRemote();
	console.log("Done.");
}

try {
	main();
} catch (e) {
	if (e && typeof e === "object" && "stderr" in e && e.stderr) {
		const err = Buffer.isBuffer(e.stderr) ? e.stderr.toString("utf8") : String(e.stderr);
		if (err.trim()) console.error(err.trim());
	}
	console.error(e instanceof Error ? e.message : e);
	process.exitCode = 1;
}
