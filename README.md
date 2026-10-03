# Car Wash Management System

Management system for a car wash + garage: wash flow with WhatsApp pickup notice,
garage fees, packages, three stocks (wash materials, car products, buffet), workers pay,
finance reports, thermal receipts. Arabic RTL, prices in Syrian pounds, works offline.

## Requirements

- Node 22, pnpm 10
- Docker (for PostgreSQL)

## Getting started

```bash
pnpm install
docker compose up -d                 # PostgreSQL (dev + test databases)
cp apps/api/.env.example apps/api/.env
pnpm --filter @carwash/shared build  # the apps use the built shared package

pnpm --filter @carwash/api dev       # API on http://localhost:3000/api
pnpm --filter @carwash/web dev       # website on http://localhost:5173
```

## Checks

```bash
pnpm test        # all tests (API tests need the test database)
pnpm typecheck
pnpm lint
pnpm format:check

pnpm build && pnpm --filter @carwash/e2e e2e   # browser tests: two laptops, offline, sync
```

The same checks run on GitHub for every push.

## Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the folder layout and code rules.
