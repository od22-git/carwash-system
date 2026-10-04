# Architecture & code rules

## Repository layout

```
apps/
  api/        NestJS server (PostgreSQL via Drizzle ORM)
  web/        React + Vite PWA, Arabic RTL, works offline
packages/
  shared/     Business rules, types and API contracts used by BOTH api and web
e2e/          Browser tests (Playwright): two laptops, offline work, sync
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
  common/        time helpers, numbering, base types (SYP)
  contracts/     sync + auth API shapes, shared record fields (carReceiptFields, nullableTime)
  money/         format-syp
  catalog/       car-size, wash-price, service records
  garage/        garage-settings, pickup-fee, parking-fee, covered-fee, plans and sessions
  subscriptions/ packages, subscriptions sold per car, free-wash use
  tickets/       ticket-status (allowed status changes), ticket-totals
  workers/       pay-type, worker-pay (what each worker earned), payments (advances, wages)
  stock/         product, movement and sale records; ledger (levels, average cost), counts
                 (evening waste), period summaries, sale lines (piece / carton prices)
  finance/       expenses, monthly budgets, revenue by source, spending by budget line
  debts/         payments on account; receipts taken on credit (paidLater) and balances
  cash/          the day's cash in (paid now + debts paid), the daily close and its difference
  customers/     syrian-phone, arabic-name, duplicates, plate
  whatsapp/      template, link
  audit/         audit events (cancellations, deletions)
  users/         role
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

React Router for screens, Dexie (IndexedDB) for the laptop database, `useLiveQuery` so
screens update by themselves when data changes (saved here or synced from the other laptop).

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
feature only through that feature's `index.ts`. Feature imports go one way:
`settings, customers, catalog, workers` ← `garage` ← `wash`, `stock` ← `sales`, and
`debts` ← `customers, wash, garage, finance` (they show the pay-later switch, the tag and the
customer's account).

Reused building blocks:

- `customers`: `CarPicker` (plate → known car, or a new car and customer) and `CarHeader`.
- `shared/ui`: `RegisterPanel` (the framed form above a board), `Receipt` / `ReceiptRow`
  (80 mm print layout; the plate is optional), `CancelReceiptForm` (admin cancel with optional
  reason), `Table`, `ChoiceGroup` (one-tap choice), `SelectField`, `Notice` (info / success /
  warning / error).
- `shared/lib`: `UserError` (a message shown to the user as it is), `date-input` (day and month
  pickers, `dayRange` / `monthRange` for reports), `parseWholeNumber`.
- `stock`: `StockContext` shared by the stock and waste screens; `useLowStockCount` for the menu.
- `shared/ui`: `PeriodPicker` (day / week from Saturday / month), `PeriodSection` (with an
  `actions` slot), `Stats`, `ExportButton`.
- `shared/lib/excel`: `downloadExcel(fileName, sheets)` — right-to-left workbooks from plain
  `SheetSpec`s (title, columns, rows, totals); exceljs is loaded only when exporting. Each
  report builds its sheets in its feature's `lib/*-sheets.ts` (pure, unit-tested).
- `shared/lib`: `periodLabel` (file names) and `periodTitle` / `formatMonth` (titles, Syrian
  month names; dates in titles use slashes so Arabic text does not flip them).
- `debts`: `PayLaterToggle` next to a deliver button, `PaidLaterTag` next to an amount,
  `DebtPanel` (the customer's account) and `DebtorsTable` (who owes, on the finance page).
- `core/db`: `nextReceiptNo()` — one receipt series per laptop for wash, garage and packages;
  `inRange(table, index, [from, to])` for reports.
- `core/audit`: `logAudit()` for sensitive actions.

## Offline sync in one paragraph

Every record has a UUID made on the laptop. Features write only through `saveRecord()`
(core/sync), which saves to IndexedDB and to an outbox in one transaction.
The sync worker pushes the outbox to `POST /sync/push` (safe to repeat) and pulls
changes from `GET /sync/pull?since=…`, filtered by role. Money and stock are append-only
ledgers, so the two laptops never overwrite each other; editable records (customers,
settings) use last-write-wins on `updatedAt`.

### Adding a synced table (checklist)

1. `packages/shared`: a zod record schema built on `syncRecordBase`.
2. `apps/api/src/modules/<feature>/`: `<feature>.schema.ts` (table with `syncColumns()`),
   `<feature>.sync.ts` (a `SyncEntry`: who may push / pull, optional `project` to hide fields
   per role, optional `authorize` — use `receiptRules([...locked statuses])` for anything with a
   printed receipt, `appendOnly` for logs, `cashierCreatesOnly` when the cashier records and only
   the admin corrects), and `providers: [registerSyncTables(entry)]` in the
   module. Export the table from
   `database/schema.ts`, then `pnpm --filter @carwash/api db:generate --name <change>`.
3. `apps/web/src/core/db/`: a new `version()` block in `local-db.ts`, one line in
   `synced-tables.ts`, and the schema in `record-schemas.ts` (the laptop validates before saving).

Synced tables have no foreign keys: laptops sync independently, so a row may arrive before the
row it points to. Prefer fixed ids when two laptops may create "the same" row (prices use
`<serviceId>:<size>`).
