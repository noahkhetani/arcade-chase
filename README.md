# NEON RUNNER

A fast-paced browser arcade game by NK. Dodge obstacles, collect orbs, and chase the high score.

Built with React, TypeScript, Express. Runs on web, mobile (Expo), PWA, and Chrome extension.

## Quick start

```
npm install
npm run dev    → http://localhost:5000
npm run check  → tsc (typecheck)
npm run build  → production build
npm start      → serve production build
npm run db:push → push schema to PostgreSQL
```

## Stack

- React 18 + Vite (root: `client/`)
- Express + tsx dev
- PostgreSQL + Drizzle ORM
- Zustand state management
- Tailwind CSS
- Web Audio API (procedural sounds)

## Structure

| Directory | Purpose |
|---|---|
| `client/src/` | React app |
| `server/` | Express backend |
| `shared/` | Types + DB schema |
| `mobile-app/` | Expo/React Native |
| `chrome-extension/` | Vanilla JS Chrome extension |
| `migrations/` | Drizzle SQL migrations |

## Cheat

Press **8** during gameplay → enter passcode `7456660641` for 18 cheat effects.

## Deployment

- Render: auto-deploys from `main` branch
- Replit: autoscale on port 5000
- Requires `DATABASE_URL` env var
