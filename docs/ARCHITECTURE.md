# Architecture & code rules

## Repository layout

```
apps/
  api/        NestJS server (PostgreSQL via Drizzle ORM)
  web/        React + Vite PWA, Arabic RTL, works offline
packages/
  shared/     Business rules + types used by BOTH api and web
docs/         This file and other project docs
```

## Rules for every file

1. **One job per file.** Aim for under ~100 lines; split anything that grows past ~150.
2. **Organize by feature, not by file type.** `garage/pickup-fee.ts`, not `utils/fees.ts`.
3. **Each folder has an `index.ts`** that exports its public parts. Import from the folder,
   never from a file deep inside another feature.
4. **Tests sit next to the code**: `pickup-fee.ts` → `pickup-fee.test.ts`.
5. **File names are kebab-case**; types and classes are PascalCase; functions camelCase.
6. **No business math outside `packages/shared`.** Prices, fees, pay, stock and waste are
   calculated only there, so the offline laptop and the server always agree.
7. **Money is whole Syrian pounds (integers).** No floats for amounts.
8. **No magic numbers.** Rates, minutes and limits live in settings or named constants.

## packages/shared — by business area

```
src/
  common/      time helpers, base types (SYP)
  money/       format-syp, receipt-number
  catalog/     car-size, wash-price
  garage/      garage-settings, pickup-fee, parking-fee
  tickets/     ticket-status (allowed status changes)
  workers/     pay-type, worker-pay
  stock/       product-kind, stock-ledger, units, daily-waste
  customers/   syrian-phone, arabic-name, duplicates
  whatsapp/    template, link
  users/       role
```

Pure functions only: no database, no network, no React.

## apps/api — one NestJS module per feature

```
src/
  main.ts
  app.module.ts
  config/                 env loading + validation
  database/               Drizzle client module, migrations
  common/                 guards, decorators, filters, pipes shared by modules
  modules/
    <feature>/            e.g. customers, tickets, workers, stock, sync, auth
      <feature>.module.ts
      <feature>.controller.ts   HTTP only: validate input, call the service
      <feature>.service.ts      the use cases; calls shared rules + the repository
      <feature>.repository.ts   all database queries for this feature
      <feature>.schema.ts       Drizzle table definitions for this feature
      dto/                      request/response shapes (zod)
      <feature>.service.test.ts
```

Flow: controller → service → repository. Controllers never touch the database;
repositories never contain business rules.

## apps/web — feature folders

```
src/
  app/          router, providers, layout shell (RTL), menus per role
  core/
    db/         Dexie (IndexedDB) tables — the app reads from here, online or offline
    sync/       outbox + push/pull worker
    auth/       login, offline session, role checks
  shared/
    ui/         small reusable components (Button, Field, Table, PlateChip, Money)
    lib/        formatting, hooks used everywhere
  features/
    <feature>/  e.g. wash, garage, customers, stock, buffet, waste, workers, finance
      pages/        route screens
      components/   pieces used only by this feature
      hooks/        data + actions (read Dexie, write Dexie + outbox)
      index.ts      what the router and other features may use
```

A feature may import from `shared/`, `core/` and `@carwash/shared`, and from another
feature only through that feature's `index.ts`.

## Offline sync in one paragraph

Every record has a UUID made on the laptop. Writes go to IndexedDB and to an outbox.
The sync worker pushes the outbox to `POST /sync/push` (safe to repeat) and pulls
changes from `GET /sync/pull?since=…`, filtered by role. Money and stock are append-only
ledgers, so the two laptops never overwrite each other; editable records (customers,
settings) use last-write-wins on `updatedAt`.
