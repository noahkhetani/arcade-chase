# neon runner

a fast browser arcade game. dodge obstacles, grab orbs, chase the high score.
react + typescript + express, runs on web, mobile (expo), pwa, and as a chrome
extension.

## play it

🎮 [play neon runner](https://arcade-runner-by-nk.onrender.com/)

## quick start

```
npm install
npm run dev     → http://localhost:5000
npm run check   → typecheck
npm run build   → prod build
npm start       → serve the prod build
npm run db:push → push schema to postgres
```

## stack

- react 18 + vite (in `client/`)
- express + tsx
- postgres + drizzle orm
- zustand for state
- tailwind
- web audio for procedural sound

## structure

| dir | what |
|---|---|
| `client/src/` | the react app |
| `server/` | express backend |
| `shared/` | types + db schema |
| `mobile-app/` | expo / react native |
| `chrome-extension/` | vanilla js chrome extension |
| `migrations/` | drizzle sql |

## cheat

press **8** mid-game, punch in `7456660641`, and u get 18 cheat effects.

## deploy

render auto-deploys from `main`, replit autoscales on port 5000. needs a
`DATABASE_URL` env var.
