# NEON RUNNER — repo guide for agents

## Project

Full-stack browser arcade game (React 18 + Express + PostgreSQL). PWA, Chrome extension, and Expo mobile app variants.

## Repo structure

All code in root `package.json` — NOT a monorepo workspace. Subdirectories are separate deployment targets:

| Directory | Purpose |
|---|---|
| `client/src/` | React app (Vite root = `client/`) |
| `server/` | Express backend (entry: `server/index.ts`) |
| `shared/` | Shared types + DB schema (`shared/schema.ts`) |
| `mobile-app/` | Standalone Expo/React Native project |
| `chrome-extension/` | Standalone Chrome extension (not React-based) |
| `migrations/` | Drizzle Kit SQL migrations |

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Start dev server (tsx) on port **5000** |
| `npm run build` | `vite build` + `esbuild server/index.ts --outdir=dist` |
| `npm start` | `NODE_ENV=production node dist/index.js` |
| `npm run check` | `tsc` (typecheck only, noEmit) |
| `npm run db:push` | `drizzle-kit push` — pushes schema to PostgreSQL |

No lint, no test, no formatter commands exist.

## Dev server

- Single `npm run dev` serves both frontend (Vite dev middleware) and API on `localhost:5000`.
- Vite root is `client/`, not project root.
- Path aliases: `@/` → `client/src/`, `@shared/` → `shared/`.

## Build pipeline

1. Vite builds client → `dist/public/`
2. esbuild bundles `server/index.ts` → `dist/index.js` (ESM, platform=node, packages=external)
3. Production start serves `dist/public/` as static files.

## Database

- PostgreSQL via Neon + Drizzle ORM.
- `DATABASE_URL` env var required for migrations and server runtime.
- Schema: `shared/schema.ts`. Tables: `users`, `leaderboard`.
- Leaderboard API at `/api/leaderboard`. One entry per player (upsert on higher score).

## Game engine

Custom 2D Canvas engine in `client/src/lib/game/`. Not a framework — plain TypeScript classes.

Zustand stores: `useGame`, `useAudio`, `useHighScore`, `useAuth` in `client/src/lib/stores/`.

## Audio

All sounds procedurally generated via Web Audio API (no audio files). Background ambient soundscape with oscillators + noise. Respects `gameSettings` toggles.

## Chrome extension

Standalone project in `chrome-extension/`. Vanilla JS, not React. Install via "Load unpacked" at `chrome://extensions/`. ZIP download route at `/download/arcade-collector-chrome-extension.zip`.

## Mobile app

Standalone Expo project in `mobile-app/`. Uses `@react-native-async-storage/async-storage`. Build APK with `eas build -p android --profile preview`.

## Cheat system

Passcode `7456660641`, activated by pressing **`8`** during gameplay. 18 cheat effects across 5 categories.

## Deployment

- Replit: `.replit` config, autoscale target, port 5000 → 80.
- Render: `render.yaml` — free plan, build = `npm install --include=dev && npm run build`, start = `npm start`.

## Gotchas

- No ESLint/Prettier config. No test runner.
- Vite custom logger calls `process.exit(1)` on errors — Vite errors kill the dev server.
- `DATABASE_URL` is required at import time in both `server/db.ts` and `drizzle.config.ts`. Server will crash on startup if missing.
- `tsconfig.json` excludes `**/*.test.ts` from compilation.
- Service worker at `/sw.js`, manifest at `/manifest.json` — both served from `dist/public/` in production.
- `.gitignore` includes `dist/` and `server/public/`.
