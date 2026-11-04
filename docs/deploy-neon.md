# Deploying on Neon as the least-privilege role

The app connects as `museum_app` (no DDL, no delete on exhibits, append-only
version and audit tables). Migrations still run as the database owner.

1. Apply the migrations with the **unpooled owner** URL:
   `DATABASE_URL="<owner unpooled url>" npm run db:migrate`
   (0003 grants `delete` on `supports`, `contradicts`, `claims` and allows the
   `withdrawn` publication state. Safe to run on a database that already has 0001 and 0002.)
2. In the Neon SQL editor, give the role a password (never commit it):
   `alter role museum_app with login password '<long random password>';`
3. In Vercel, set `DATABASE_URL` to the **pooled** connection string for user
   `museum_app` (host contains `-pooler`, same database, `sslmode=require`),
   then redeploy.
4. Confirm the database holds exhibits: `select count(*) from exhibits;`.
   The live database wins over the bundled snapshot at runtime, so if it is empty
   run `DATABASE_URL="<owner unpooled url>" npm run db:seed` (after the Part 2 changes land).
5. Smoke test: open an exhibit, submit a suggestion, and sign in to the editor.
   A `permission denied` error in the Vercel logs means a grant is missing; add
   it in a new migration and extend `src/server/appRole.pglite.test.ts`.
