# Deploying on Neon as the least-privilege role

The app connects as `museum_app` (no DDL, no delete on exhibits, append-only
version and audit tables). Migrations still run as the database owner.

Two connection strings are used. `DATABASE_MIGRATION_URL` is the **owner, unpooled**
URL and is only used by `npm run db:migrate` and `npm run db:seed`. `DATABASE_URL`
is the **museum_app, pooled** URL that the app and `npm run db:audit` use. If a
password contains special characters (`@`, `:`, `/`, `?`, `#`, `%`, `&` and so on),
URL-encode them in the connection string, for example `@` becomes `%40`.

Run the steps in this order: migrate, then audit (dry run first), then redeploy.
The public site shows only confirmed exhibits, so deploying this code before the audit
has run would hide every exhibit the live database still marks as reported.

1. Apply the migrations as the owner:
   `DATABASE_MIGRATION_URL="<owner unpooled url>" npm run db:migrate`
   (0003 grants `delete` on `supports`, `contradicts`, `claims` and allows the
   `withdrawn` publication state. Safe to run on a database that already has 0001 and 0002.)
2. In the Neon SQL editor, give the role a password (never commit it):
   `alter role museum_app with login password '<long random password>';`
3. Confirm the database holds exhibits: `select count(*) from exhibits;`.
   The live database wins over the bundled snapshot at runtime, so if it is empty
   run `DATABASE_MIGRATION_URL="<owner unpooled url>" npm run db:seed`. A fresh seed
   already includes the audit, so step 4 then has nothing to do.
4. Apply the November 2026 accuracy audit (docs/accuracy-audit-2026-11.md) as museum_app.
   First see the plan without writing anything:
   `DATABASE_URL="<museum_app pooled url>" npm run db:audit -- --dry-run`
   then apply it:
   `DATABASE_URL="<museum_app pooled url>" npm run db:audit`
   It withdraws the eight exhibits that failed the audit and brings every other exhibit's
   confidence, sources and wording in line with the seed. Each change goes through the
   normal save path, so it appends a version and shows in the changelog. It is safe to run
   again; exhibits that already match are skipped. A script cannot clear the app's cached
   museum, so the site shows the change after the redeploy in step 5.
5. In Vercel, set `DATABASE_URL` to the **pooled** connection string for user
   `museum_app` (host contains `-pooler`, same database, `sslmode=require`),
   then redeploy.
6. Smoke test: open an exhibit, submit a suggestion, and sign in to the editor.
   A `permission denied` error in the Vercel logs means a grant is missing; add
   it in a new migration and extend `src/server/appRole.pglite.test.ts`.
