# Language Translation Tool

A beginner-friendly language translation app for entering text, selecting two languages, translating through a real API, and copying the result.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/language-translator run dev` — run the translation app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/language-translator/src/App.tsx` — translation flow, language controls, API request, and copy behavior
- `artifacts/language-translator/src/index.css` — visual theme and responsive layout
- `artifacts/language-translator/.replit-artifact/artifact.toml` — preview and workflow metadata

## Architecture decisions

- The first build is a single-page React/Vite app so it stays easy to read for an internship project.
- Translation uses the MyMemory HTTPS API directly from the browser; the app does not require a user API key for the demo flow.

## Product

- Enter up to 500 characters and choose source and target languages.
- Translate with loading and error feedback, swap languages, try an example, clear the input, and copy the result.

## Gotchas

- MyMemory is a public demo translation service; it may enforce rate limits or return imperfect wording for uncommon phrases.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
