# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router (routes, layouts, server actions).
- `src/components`, `src/lib`, `src/hooks`, `src/providers`, `src/types`: UI, utilities, and shared types.
- `convex/`: Convex backend functions and schemas (`query/`, `mutate/`, `http.ts`, `schemas/`, `_generated/`).
- `public/`: Static assets. `scripts/`: one‑off maintenance scripts (Vapi/tooling).
- Config: `eslint.config.mjs`, `tsconfig.json` (aliases `@/*`, `@convex/*`), `postcss.config.mjs`, `next.config.ts`.
- Env: `.env`, `.env.local` for secrets; never commit credentials.

## Build, Test, and Development Commands
- `pnpm dev`: Start the Next.js dev server (Turbopack).
- `pnpm build`: Build the production bundle.
- `pnpm start`: Serve the production build.
- `pnpm lint`: Run ESLint using the project config.
- Convex (optional): `npx convex dev` to run the Convex dev server; `npx convex codegen` to refresh generated types in `convex/_generated/`.

## Coding Style & Naming Conventions
- TypeScript with `strict` mode; use path aliases `@/*` and `@convex/*`.
- Prefer 2‑space indentation; format with Prettier 3: `npx prettier -w .`.
- ESLint extends `next/core-web-vitals` and `next/typescript`; fix lint warnings before committing.
- Components: PascalCase in `src/components`. Hooks: `useX.ts`. Route segments in `src/app` use folder‑based routing.
- Keep server code in `convex/` and server components minimal; share types via `src/types` or Convex schemas.

## Testing Guidelines
- No project‑wide test runner is configured yet. Include a brief manual test plan in PRs (steps, expected vs. actual, screenshots for UI).
- If introducing tests, prefer colocating `*.test.ts(x)` under `src/**/__tests__` and aim for critical path coverage first (routing, forms, Convex interactions).

## Commit & Pull Request Guidelines
- Commits: short, imperative subjects; optional scope/prefix (e.g., `feat:`, `fix:`, `chore:`, `ui:`) aligned with existing history.
- PRs: clear description, linked issues, screenshots for UI changes, verification steps, and any required env vars or data notes. Keep diffs focused and update docs/types when changing `convex/schemas`.

## Security & Configuration Tips
- Store secrets in `.env.local` (OpenAI, Vapi, WorkOS, Polar, Resend, Convex). Do not commit secrets.
- Validate inputs at boundaries; reuse Zod schemas in `convex/schemas` where possible.
