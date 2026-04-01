# AISprints Starter

This repository is a starter template for aisprints. It is designed for experienced human programmers who are well-versed in end-to-end software development to use AI effectively for developing and maintaining software applications.

## Purpose

This starter provides a structured approach to AI-assisted development by offering:

- **Cursor Rules** (`AGENTS.md` and `.cursor\rules`) - Intended to create and maintain comprehensive guidelines and constraints that guide AI behavior during development
- **Technical PRD Templates** (`docs/TECHNICAL_PRD_TEMPLATE.md`) - Standardized templates for documenting technical product requirements, implementation phases, and progress tracking

These resources ensure that AI agents are guided and constrained by established rules and your specific directions, enabling more predictable and maintainable development workflows.

## Getting Started

1. Review the cursor rules in `AGENTS.md` to understand the development guidelines
2. Use the technical PRD template in `docs/TECHNICAL_PRD_TEMPLATE.md` when starting new features
3. Customize the rules and templates to match your project's specific needs

## Project Structure

- `AGENTS.md` - Cursor rules and development guidelines
- `docs/TECHNICAL_PRD_TEMPLATE.md` - Template for technical product requirement documents
- `docs/PROJECT_OVERVIEW.md` - Project-specific documentation

## Technology Stack

This starter is built on:

- [Next.js](https://nextjs.org) - React framework
- [Cloudflare Workers](https://workers.cloudflare.com) - Serverless deployment platform
- [OpenNext.js](https://opennext.js.org/cloudflare) - Next.js adapter for Cloudflare

## Development

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment variables (Sprint 1 auth)

Normative contract (paths, JSON, status codes, JWT): [`docs/sprint-1/prd-auth-contract-env.mdc`](docs/sprint-1/prd-auth-contract-env.mdc).

| Variable | Role |
|----------|------|
| `AUTH_JWT_SECRET` | Required for HS256 JWT sign/verify. Never commit real values. |
| `NEXTJS_ENV` | Optional; matches Cloudflare/local tooling. |
| D1 binding `quizmaker_app_database` | Declared in `wrangler.jsonc`, not as a plain env string. |

Copy [`.env.example`](.env.example) to `.env.local` if you use Next env files for documentation; for **OpenNext + Wrangler** local dev, put secrets in **`.dev.vars`** (see [`.dev.vars.example`](.dev.vars.example)). Regenerate bindings in `cloudflare-env.d.ts` after Wrangler changes with `npm run cf-typegen`.

**Canonical auth HTTP paths:** `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/me`, `POST /api/auth/logout` — not `/api/auth/register` or `GET /api/auth/me`.

Shared TypeScript + Zod for §2–§3: [`src/lib/auth-contract.ts`](src/lib/auth-contract.ts).

## Preview

Preview the application locally on the Cloudflare runtime:

```bash
npm run preview
```

## Deploy

Deploy the application to Cloudflare:

```bash
npm run deploy
```
