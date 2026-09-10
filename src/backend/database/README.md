# Database

This directory contains the future persistence boundary. It currently exposes a
lazy, reusable MySQL pool without mapping tables or adding business logic.

## Configuration

Set `DATABASE_URL` in `.env.local` using this format:

```text
mysql://username:password@host:3306/database_name
```

Credentials must be URL-encoded when they contain reserved characters such as
`@`, `:`, `/`, `?`, or `#`. The value is parsed only when
`getDatabasePool()` is first called, so builds and routes that do not use the
database do not open a connection.

```ts
import { getDatabasePool } from "@/backend/database/pool";

const pool = getDatabasePool();
```

Do not commit `.env.local` or other files containing real credentials.
Migrations live in `migrations/` and run explicitly with `npm run db:migrate`.
The runner extracts the target database from `DATABASE_URL`, creates it if
needed, and records a migration only after its SQL and tracking insert succeed.
The demo seed is destructive (`TRUNCATE`) and is blocked unless invoked as
`npm run db:seed -- --confirm-seed` or confirmed with
`SEED_CONFIRM_DATABASE` set to the exact target database name.
