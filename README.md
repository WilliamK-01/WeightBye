# LOCALWEIGHT

LocalWeight is a local-first weight tracking web app with analytics, gamification, and polished UI/UX.

It is designed to run entirely on your machine with no external APIs.

## Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS + shadcn-style UI primitives
- Framer Motion
- Recharts
- Lucide icons
- Prisma ORM + SQLite
- Zod + React Hook Form
- Sonner toasts
- ESLint + Prettier
- Docker + docker-compose

## Core Features

- Onboarding profile creation with unit preference and optional metadata
- Dashboard with:
- current weight
- change since start
- 7-day change
- streak and weekly average
- projected goal date (linear regression)
- weight trend chart + 7-day moving average overlay
- daily motivational quote from local JSON (60 quotes)
- quick add/update form
- next achievement + recent unlock preview
- level and XP progress display
- plateau detection (14-day no-decrease signal)
- Log page with add/edit/delete, desktop table + mobile cards
- Achievements page with locked/unlocked states and progress tracking
- Settings page with:
- profile settings
- theme controls (dark/light + accent themes)
- title equip system by level
- CSV export and JSON backup
- JSON import restore
- full data reset
- optional PIN storage

## Routes

- `/onboarding`
- `/dashboard`
- `/log`
- `/achievements`
- `/settings`
- API:
- `/api/entries`
- `/api/entries/[id]`
- `/api/profile`
- `/api/achievements`
- `/api/backup/export`
- `/api/backup/import`
- `/api/reset`

## Database

SQLite database path:

- `data/localweight.db`

Prisma schema:

- `prisma/schema.prisma`

Main models:

- `UserProfile`
- `WeightEntry`
- `Achievement`
- `UserAchievement`
- `UserProgress`

## Setup (Local)

1. Install dependencies:

```bash
npm install
```

2. Initialize DB schema:

```bash
npm run db:push
```

3. Seed achievements (40 definitions):

```bash
npm run db:seed
```

4. Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Note: scripts auto-create `data/` and bootstrap `.env` from `.env.example` when missing.

## Environment

`.env.example`:

```env
DATABASE_URL="file:../data/localweight.db"
```

## Production Build

```bash
npm run build
npm run start
```

## Docker

Build and run:

```bash
docker compose up --build
```

App runs at `http://localhost:3000`.

Data is persisted to `./data` via volume mount.

## Backup and Restore

- Export CSV:
- Settings -> Backup -> Export CSV
- or `GET /api/backup/export?format=csv`
- Export JSON:
- Settings -> Backup -> Export JSON
- or `GET /api/backup/export?format=json`
- Import JSON:
- Settings -> Backup -> Import JSON
- uploads complete dataset and recalculates progression

## Achievement System

Seeded achievement keys include:

- streaks (`STREAK_3`, `STREAK_7`, `STREAK_14`, `STREAK_30`, `STREAK_60`, `STREAK_100`)
- progress milestones (`WEIGHT_LOSS_1KG`, `WEIGHT_LOSS_3KG`, `WEIGHT_LOSS_5KG`, `WEIGHT_LOSS_10KG`, `WEIGHT_LOSS_15KG`, `GOAL_REACHED`)
- behavior and exploration (`LOG_NOTE_7`, `WAIST_LOG_7`, `EXPORT_BACKUP`, `IMPORT_BACKUP`, `DARK_MODE_ENABLED`)
- plus additional habit/milestone achievements for a total of 40.

Achievement syncing and XP recalculation are handled in:

- `lib/achievements.ts`

## Leveling System

XP sources:

- Daily weigh-in: 10 XP
- Waist logged: +5 XP
- Note logged: +5 XP
- Achievements: per-achievement reward

Level formula:

- `level = floor(sqrt(xp_total / 150)) + 1`

Theme unlock levels are defined in:

- `lib/unlocks.ts`

## Analytics

Analytics utilities in `lib/analytics.ts` provide:

- 7-day moving average
- weekly averages
- streak calculation
- trend detection
- goal projection by linear regression
- plateau detection

## Lint and Format

```bash
npm run lint
npm run format
```

## Project Notes

- No external APIs are used.
- Quotes are local JSON data in `data/quotes.json`.
- Database file is local only.