# Live museum foundation

Date: 2026-10-03

This round makes Hall of Eras a public website that can be edited without a deploy, while staying free and open. Visitors never create accounts. Rooms after Precursors stay generic halls; bespoke rooms come later.

## Decisions

- One room is one era. Each exhibit has a shareable page at `/rooms/[era]/[exhibit]`.
- The 3D corridor and year rail stay the front door. Flatland stays the path without WebGL.
- An exhibit page has three reading sections: Sources, How the field changed, and Revision history.
- Content lives in Supabase Postgres (free tier) and is read at runtime. Hosting is Vercel Hobby. No paid service is required.
- The editor at `/editor` opens with a long passphrase stored as an environment variable. A signed cookie keeps the session. There are no accounts.
- Anyone may suggest a correction or a source. Suggestions wait in a queue until the editor accepts or rejects them.
- "Ask the museum" is removed.
- If the database cannot be reached, the site serves a JSON snapshot bundled at build time and shows "Showing the archived copy from {date}."

## Data

The database mirrors the in-memory store: exhibits, claims, sources, supports, evolution, contradicts, an append-only `exhibit_versions` table (also the changelog), audits, suggestions, and rate-limit events. Row-level security is on. The anonymous role has no access. The app connects as a least-privilege `museum_app` role through the transaction pooler. A second free Supabase project is for local development and Preview.

`FieldChange` is `{ before, after, citationUrls }`. Every citation URL must already belong to the exhibit. Evolution links require a `sourceId` that resolves to a source, so a thread is never invented. When the field-change text is missing, the page says "The museum has not yet written how this changed the field."

A write carries a `reason` and an optional `suggestionId`. `describeRevision` compares version blobs and reports what changed (created, confidence, citations, publication state, text parts, figure). Old full text is not shown.

`MemoryStore` and `validateWrite` stay synchronous. Production loads the graph into a `MemoryStore`, calls `apply`, and saves the touched rows in one transaction. Unit tests keep using `MemoryStore` directly. Database behavior is tested with PGlite on the portable migration only.

## Routes

| Path | Role |
| --- | --- |
| `/` | Corridor |
| `/rooms/[era]` | Corridor opened on that hall |
| `/rooms/[era]/[exhibit]` | Exhibit page, suggestion form, metadata |
| `/editor` | Login or dashboard |
| `/editor/exhibits/new`, `/editor/exhibits/[id]`, `/editor/suggestions` | Editor |
| `/api/keepalive` | Daily cron, bearer `CRON_SECRET` |
| `/changelog`, `/changelog.xml`, `/accuracy` | Kept |
| `/robots.txt` | Disallows `/editor` |

Era slugs: `precursors`, `founding`, `symbolic`, `first-winter`, `expert-systems`, `second-winter`, `statistical`, `deep-learning`, `transformers`, `generative`, `frontier`. A wrong era slug redirects to the exhibit's real era. An unknown id is a 404.

## Caching and fallback

`cacheComponents` is on. `getMuseum()` uses `'use cache'`, tags the result `museum`, and uses `cacheLife('max')` for a live read. A failed read uses `cacheLife('minutes')` and the bundled snapshot. Editor saves call `updateTag('museum')`. `prebuild` refreshes the snapshot only when the database answers, so a paused project does not fail the build. A daily cron runs `select count(*)` and prunes old rate events so the free project does not pause after seven idle days. The Hobby cron limit is checked against Vercel's docs before relying on it.

## Security

`isHttpUrl` allows only `http:` and `https:` URLs with no userinfo and at most 2048 characters. `isMuseumAssetPath` allows only `/museum/...` paths without `..` or `//`. The validator, suggestion parser, database checks, and `SafeLink` all enforce this. `javascript:` and `data:` never become links.

The passphrase is compared as equal-length SHA-256 digests. It must be at least 32 characters or the editor stays off. The session cookie is HMAC-signed, httpOnly, Secure in production, `SameSite=Strict`, and lasts 8 hours. Every editor action checks the session itself. Server actions keep Next's origin check.

Suggestions use Cloudflare Turnstile, a honeypot field named `website`, and database rate limits (3 per hour per hashed IP, 100 per day overall). Login attempts are limited too. No raw IP is stored. Suggestions are refused while the site is serving the archive.

A static Content-Security-Policy is sent with nosniff, a strict referrer policy, and a locked-down permissions policy. The 3D labels use a self-hosted IBM Plex Mono file so the policy does not need a font CDN.

## Pages

The exhibit page keeps the existing palette and type: stone floor, brass year and hall name, one zinc plate, ink text at 65ch. Order is title and confidence, figure credit, story, then the three sections. The dossier and Flatland link to the full page. The suggestion form sits in a disclosure and loads Turnstile only when opened. The archive line is quiet text on the floor. The editor uses the same tokens in a plain form layout, with a required reason on every save.

## Out of scope

Bespoke rooms after Precursors, search, visitor accounts, a live curator model, and any paid database or host.
