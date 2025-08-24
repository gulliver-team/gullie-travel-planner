# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router (routes, layouts, server actions).
- `src/components`, `src/lib`, `src/hooks`, `src/providers`, `src/types`: UI, utilities, shared hooks/providers, and types.
- `convex/`: Convex backend (`query/`, `mutate/`, `http.ts`, `schemas/`, `_generated/`).
- `public/`: Static assets. `scripts/`: one‑off maintenance/Vapi tooling.
- Config: `eslint.config.mjs`, `tsconfig.json` (aliases `@/*`, `@convex/*`), `postcss.config.mjs`, `next.config.ts`.
- Env: `.env`, `.env.local` for secrets (not committed).

## Build, Test, and Development Commands
- `pnpm dev`: Start Next.js dev server (Turbopack).
- `pnpm build`: Build production bundle.
- `pnpm start`: Serve the production build.
- `pnpm lint`: Run ESLint using project config.
- Convex: `npx convex dev` (dev server), `npx convex codegen` (refresh types in `convex/_generated/`).

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` mode.
- Indentation: 2 spaces; format with Prettier 3: `npx prettier -w .`.
- Linting: Extends `next/core-web-vitals` and `next/typescript`; fix warnings before committing.
- Naming: Components in `src/components` use PascalCase; hooks as `useX.ts`; route segments are folder‑based in `src/app`.
- Server code lives in `convex/`; share types via `src/types` or Convex schemas.

## Testing Guidelines
- No project‑wide test runner yet. Include a brief manual test plan in PRs (steps, expected vs actual, screenshots for UI).
- If adding tests, colocate under `src/**/__tests__` and name `*.test.ts`/`*.test.tsx`; focus on critical paths (routing, forms, Convex interactions).

## Commit & Pull Request Guidelines
- Commits: short, imperative subjects with optional scope (e.g., `feat:`, `fix:`, `chore:`, `ui:`). Keep diffs focused and related.
- PRs: clear description, linked issues, screenshots for UI changes, verification steps, and any required env vars/data. Update docs/types when changing `convex/schemas`.

## Security & Configuration Tips
- Store secrets in `.env.local` (e.g., OpenAI, Vapi, WorkOS, Polar, Resend, Convex). Never commit credentials.
- Validate inputs at boundaries; reuse Zod schemas from `convex/schemas` where possible.
