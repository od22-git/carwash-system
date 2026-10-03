# Car Wash Management System

Management system for a car wash + garage: wash flow with WhatsApp pickup notice,
garage fees, packages, three stocks (wash materials, car products, buffet), workers pay,
finance reports, thermal receipts. Arabic RTL, prices in Syrian pounds, works offline.

## Requirements

- Node 22 or newer, pnpm 10
- Docker **or** Podman (for PostgreSQL)

On Fedora:

```bash
sudo dnf install nodejs podman podman-compose git
node -v                       # must print v22 or newer
sudo npm install -g pnpm@10
```

## Getting started

```bash
git clone https://github.com/od22-git/carwash-system.git
cd carwash-system
pnpm install

podman-compose up -d                 # or: docker compose up -d   (PostgreSQL + test databases)
cp apps/api/.env.example apps/api/.env
pnpm --filter @carwash/shared build  # the apps use the built shared package
pnpm --filter @carwash/api db:migrate  # creates the tables (run again after pulling new migrations)
```

Then, in two terminals:

```bash
pnpm --filter @carwash/api dev       # API on http://localhost:3000/api
pnpm --filter @carwash/web dev       # website on http://localhost:5173
```

Open http://localhost:5173. On a fresh database the app asks you to create the admin account.

## Checks

```bash
pnpm test        # all tests (API tests need the database running)
pnpm typecheck
pnpm lint
pnpm format:check

pnpm build && pnpm --filter @carwash/e2e e2e   # browser tests: two laptops, offline, sync
```

The browser tests need Chromium once: `pnpm --filter @carwash/e2e exec playwright install chromium`.
The same checks run on GitHub for every push.

## Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the folder layout and code rules.
