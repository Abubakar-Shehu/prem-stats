# Prem Stats

Premier League dashboard built with **React 19** and **Vite 8**. Browse standings, team form, fixtures, and player goals / starts / assists across recent seasons.

Live site: [prem-stats.vercel.app](https://prem-stats.vercel.app)

## Features

- Season tabs for **2026/27 (current)**, 2025/26, 2024/25, and 2023/24 (`?season=YYYY`)
- Favourite-team picker with team crest, recent results, key stats, and fixtures
- League table standings
- Player leaderboard: **Goals (G)**, **Starts (ST)**, **Assists (A)** — filters to the selected team
- Sign in / sign up via the Fly auth backend (session stored in the browser)
- Light / dark theme toggle

## Stack

- React 19 + React Router 7
- Vite 8 (dev server + production build)
- Same-origin API routes:
  - Vite middleware in development (`server/`)
  - Vercel serverless functions in production (`api/`)
- Auth proxied to [backend-nkn2pg.fly.dev](https://backend-nkn2pg.fly.dev)

## Data sources

| Data | Source |
|------|--------|
| Teams, table, matches | [openfootball](https://github.com/openfootball/football.json) by default; [football-data.org](https://www.football-data.org/) when `FOOTBALL_DATA_API_KEY` is set |
| Player goals / starts / assists | Fantasy Premier League API (live current season) and [FPL archive CSVs](https://github.com/vaastav/Fantasy-Premier-League) for previous seasons |

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm dev
```

App: [http://localhost:5173](http://localhost:5173)

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite with season-aware `/api/prem*` routes |
| `pnpm build` | Production build to `dist/` |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | ESLint |

Use `npm` if you prefer; keep `pnpm-lock.yaml` in sync when changing dependencies (CI / Vercel installs with frozen lockfile).

## Environment

Copy `.env.example` to `.env`:

| Variable | Purpose |
|----------|---------|
| `VITE_URL` | Leave empty to use same-origin API routes |
| `VITE_PROXY_TARGET` | Fly auth backend (default `https://backend-nkn2pg.fly.dev`) |
| `FOOTBALL_DATA_API_KEY` | Optional; prefer football-data.org for teams/table/matches |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Only if calling Supabase from the client |

## API

Same-origin routes (query `season` is the season start year, e.g. `2026` for 2026/27):

| Endpoint | Description |
|----------|-------------|
| `GET /api/prem/seasons` | Available seasons |
| `GET /api/prem?season=2026` | Premier League teams |
| `GET /api/prem/table?season=2026` | Standings |
| `GET /api/prem/matches/:teamId?season=2026` | Team matches |
| `GET /api/prem/players?season=2026&team=:id&limit=25` | Player goals / starts / assists |

Auth stays on the Fly backend via `/auth/*` (Vite proxy / Vercel rewrite). After sign-in, the returned Supabase session is saved in `localStorage` so the header stays signed in across refreshes.

## Deploy

Configured for **Vercel**:

- Static frontend from `vite build`
- Serverless handlers under `api/prem*`
- `/auth/*` rewritten to the Fly backend (`vercel.json`)
- SPA fallback so `/signin` and `/signup` serve `index.html`

## Project layout

```text
api/                 Vercel serverless API
server/              Shared data layer + Vite middleware
src/components/      UI (season tabs, table, player stats, …)
src/pages/           Home, sign-in, sign-up
```
