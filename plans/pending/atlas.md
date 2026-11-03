# HistoryAI Atlas: sourced AI data in an interactive 3D scene

Ticket: none. On approval, step 0.0 copies this file to `plans/pending/atlas.md` in the repo.

## Context

HistoryAI is a Next.js museum of AI history. Its provenance is strong in method but thin in coverage:

- All 35 exhibits carry inline citations, but only 2 have formal `Source` records, there are 0 evolution edges, and the `dataset` / `benchmark` kinds are unused.
- Sources today are DOIs, arXiv, Wikipedia (the most common), archive.org, museums and institutions, and lab pages. No quantitative source is used, even though the story is about exponential scale.
- The front end already has a WebGL stack: three 0.186, R3F 9, drei 10, gsap 3.15. It runs the corridor (`HallCorridor.tsx`) and the night home (`HeroCloud`, `ScrollHall`). There is no d3, framer-motion, or postprocessing.
- The CSP is strict (`connect-src 'self'`, `img-src 'self' blob: data:`). So external data and images must be self-hosted.

**Outcome:** a new `/atlas` route. It is a lit, orbitable 3D scene of validated external data, linked both ways with the existing exhibits. It shows three layers: scale of AI over time, governance markers, and portraits/scans.

## Source validation (research-methods: every source paired with how it is used)

| Source | Verified | Use | Rule |
| --- | --- | --- | --- |
| Epoch AI data (`/data/ai_models.zip`, `benchmark_data.zip`) | Page fetched 2026-11-03: "Creative Commons Attribution", version unnamed. ~3,700 models, 1950 to today. Updated daily. | Scale layer | Attribute on-page. Confidence word `reported` (estimates). Confirm the licence version in step 0.1. |
| Wikimedia Commons / Internet Archive items | Licence is per file (Commons guidance) | Plates | Allow only licences already in `Figure`: PD-old, PD-US-expired, CC0-1.0, CC-BY-4.0, CC-BY-SA-4.0. Verify per file. Self-host. |
| EUR-Lex and other official legal texts | Official primary sources | Governance markers | Link the official URL. Hand-curated list. |
| AI Incident Database | Licence **not stated** on its About page. A full snapshot download exists. | Governance layer, conditional | Ships only if its Terms of Use pass step 0.1. Otherwise cited as a link only. |
| Stanford AI Index | Licence reported as CC BY-ND by secondary sites only. Unconfirmed. | none | Never redrawn or re-plotted. Link-out only. |
| arXiv metadata | CC0 for metadata. Full text is not redistributable. One request per 3 s. | Not in this plan | Parked with the citation constellation. |

## Decision log

| Decision | Chosen | Why |
| --- | --- | --- |
| Data shown | Scale of AI + governance + portraits/scans | User's pick. Citation constellation deferred. |
| Placement | New `/atlas` route plus deep links | The corridor stays untouched. Lowest risk. |
| Data flow | Build-time committed snapshots in `data/` | Works under the CSP, offline, and keeps the "retrieved date" rule. Mirrors `museum-snapshot.json`. |
| Look | Night-home palette family, lit, depth fog (user chose "richer") | Reuses the `ScrollHall` lighting. DESIGN.md gets an Atlas section, because its anti-references and "no ornamental motion" rule only cover the corridor. |
| Density | All Epoch models as one `InstancedMesh`, ~60 labelled landmarks | Keeps the exponential shape and stays at one draw call. |
| Licence rule | Verify first, link-out until clear | The site's promise is accuracy. |
| Epoch licence version (0.2, 2026-11-03) | **CC BY 4.0**, stated in the zip's README with the exact citation string to use | Resolves the "version unnamed" gap. |
| Plottable count (0.2) | `all_ai_models.csv` has 3,706 rows, but only **2,522** have a date plus compute or parameters. **1,422** have compute, **2,365** have parameters. 13 rows have no date. | The plan said "~3,700 points". The scene plots only rows that have the active metric, never invents a value, and the panel states "N of 3,706 models have a published compute estimate". |
| Confidence vocabulary (0.2) | Epoch uses Confident / Likely / Speculative / Unknown (196 blank). The museum's words are confirmed / reported / disputed / rumored. | Every Epoch point carries the museum word `reported`. Epoch's own label is kept as a detail line ("Epoch rates this estimate: Likely"). |
| Link handling (0.2) | `Link` is empty for 39 rows, holds several URLs for 101, and is non-http for 5 | The builder takes the first `https://` URL and drops the row's link if none. A point with no URL is excluded (rule: no mark without a source path). |
| Landmark count (1.2) | Only 7 exhibits have an exact Epoch row (Perceptron Mark I, Deep Blue, AlexNet, GANs, AlphaGo Lee, Transformer, AlphaFold 2). The plan's "~60 landmarks" was wrong. | 7 exhibit-linked landmarks plus 18 well-known milestone models, labelled and linked to Epoch only. 25 in total. McCulloch-Pitts, ELIZA, DENDRAL, Watson, Tay and ChatGPT have no Epoch row and are not plotted. |
| Dev deps (1.x) | Added `fflate` and `csv-parse` (dev-only), as assumed. The snapshot script unpacks only two named zip entries into memory with a size cap, and a licence guard fails the refresh if Epoch's README stops linking CC BY 4.0. | Zip is untrusted input. |
| Landmark names (0.2) | Model names do not match exhibit titles by search: no Dartmouth, ELIZA or Logic Theorist rows. `Transformer` and `GPT-3` do not match as exact names either. | 1.2 builds the mapping by hand against exact `Model` strings, not by fuzzy match. Landmarks without an Epoch row are simply not plotted. |

## Assumptions: correct me now or I proceed

1. Work continues on `feature/ai-gallery`. Its tree is already dirty with unrelated changes, so atlas files stay isolated and nothing is committed unless you ask.
2. Epoch is the only quantitative source in v1. Confidence is `reported`, never `confirmed`.
3. Two dev-only dependencies for the snapshot script only, never shipped to the client: `fflate` (read the ZIP) and a CSV parser. Step 0.2 first checks whether `package.json` already has a CSV parser.
4. Desktop-first. Touch orbit works. No-WebGL and small screens get the accessible table fallback, matching the `Flatland` pattern.
5. Motion happens only on visitor action (year scrub, orbit, focus, metric switch) plus one entrance camera move. There is no autoplay and no constant rotation. Reduced motion snaps.
6. The log scale is the default. Compute and parameters can be switched.
7. About 20-30 curated plates and about 10-15 governance markers.
8. Downloaded zips and images are handled as untrusted data, in a scratch dir, read by scripts held elsewhere.

## Phases

### Phase 0: Probe (fail fast)
Verified when: licences are recorded and Epoch's real columns are known.

- **0.0 Setup (XS).** Copy this plan to `plans/pending/atlas.md`. Read `node_modules/next/dist/docs/` on `"use cache"`, `cacheComponents` and `dynamic ssr:false` (AGENTS.md rule). Blocked by: none.
- **0.1 Licence ledger (S).** Read the licence text at the source for Epoch (version), AIID Terms, and each candidate Commons or Archive file. Write `src/atlas/sources.ts`, a registry of `{id, name, licence, licenceUrl, attribution, retrieved}`. Acceptance: every source has a verified licence URL or is flagged `linkOnly`. Verify: `npx vitest run src/atlas/sources.test.ts`. Blocked by: 0.0.
- **0.2 Epoch schema probe (S).** Download the zip to the scratchpad. Read the real column names for date, compute, parameters, domain and organisation, and the count of rows with missing compute. Record the findings in the plan's decision log. Blocked by: 0.0. (Independent of 0.1.)

### Phase 1: Data pipeline (vertical slice: Epoch to typed snapshot)
Verified when: `npm run atlas:snapshot` writes `data/atlas-snapshot.json` and tests pass.
Files: `scripts/atlas-snapshot.ts`, `src/atlas/{types,build,mapping}.ts`, `src/server/atlas.ts`, `data/atlas-snapshot.json`, `package.json` (script and dev deps).

- **1.1 Normalise (M).** Pure `buildAtlas(rows)` produces compact columnar arrays (year, log10 compute, log10 params, domain index, name, source URL). Missing values are kept as null, never invented. Acceptance: no point without a source URL, retrieved date and licence id. Verify: `npx vitest run src/atlas`. Test seam: `build.test.ts` with a fixture from 0.2. Blocked by: 0.1, 0.2.
- **1.2 Landmark mapping (S).** `mapping.ts` is an explicit table of exhibit id to Epoch model name, about 60 entries. A test fails on dangling ids and on duplicate matches. Blocked by: 1.1.
- **1.3 Snapshot script and loader (S).** The script mirrors `scripts/snapshot.ts`. `getAtlas()` uses `"use cache"` and `cacheTag("atlas")`, mirroring `getMuseum()` (`src/server/museum.ts:47`). Verify: `npm run atlas:snapshot && npx vitest run`. Blocked by: 1.1.

### Phase 2: Scale scene (the core 3D experience)
Verified when: `/atlas` renders ~3,700 points, scrubbing and orbiting are smooth, and reduced motion snaps.
Files: `app/atlas/page.tsx`, `components/atlas/{AtlasShell,ScaleScene,AtlasPanel,AtlasTable}.tsx`, `src/atlas/projection.ts`, `src/atlas/camera.ts`. Reuse: `YearScale.tsx`, `chooseView` / `cameraMove` (`src/museum/view.ts`), `hasWebGL` and `usePrefersReducedMotion` (`src/museum/env.ts`), the gsap camera tween (`HallCorridor.tsx:237`), the lighting and fog from `ScrollHall`, `labelFont.ts`, the `dynamic(..., {ssr:false})`-from-a-client-component pattern in `NightMuseum.tsx`.

- **2.1 Projection math (S).** Pure functions map year, log compute and domain to x, y and z (log scale, clamped, stable). Test seam: `projection.test.ts`, with no WebGL needed. Blocked by: 1.1.
- **2.2 Instanced scene (M).** One `InstancedMesh`. Hover picking is throttled and reports name, year, compute and the Epoch link. AI-winter bands come from `ERAS` mood. Only the ~60 landmarks get drei `Text`. Acceptance: one draw call for the points, `dpr` [1, 1.5]. Blocked by: 2.1, 1.3.
- **2.3 Interaction (M).** Elements:
  - A year scrubber (`YearScale`) that dims points after the chosen year.
  - A metric switch (compute, parameters) that animates positions only during the transition.
  - Damped orbit with limits.
  - Landmark click that tweens the camera, and snaps under reduced motion.
  - URL-hash focus state like `MuseumShell`.

  Blocked by: 2.2.
- **2.4 Accessible twin (M).** The canvas is `role=img` with a label. A DOM `AtlasTable` lists landmarks and metrics with keyboard navigation (roving focus like `ExhibitTabs`) and a `role=status` live region. No WebGL and small screens show the table only. Verify: axe in e2e. Blocked by: 2.2.

### Phase 3: Governance and plates
Verified when: both layers render only entries whose licence passed 0.1.
Files: `src/atlas/{governance,plates}.ts`, `components/atlas/{GovernanceRibbon,PlateWall}.tsx`, `public/atlas/*` (self-hosted images). Reuse: the `Figure` type and licence allowlist (`src/domain/types.ts`), `FigurePlate.tsx` lazy texture loading (focused plus neighbours).

- **3.1 Governance markers (S).** A curated list, each with an official URL and a date, drawn as ribbon markers on the year axis. AIID markers are included only if 0.1 clears it. Test seam: a data test checks that every entry has a source. Blocked by: 2.2, 0.1.
- **3.2 Plate wall (M).** Curated Commons/Archive items are downloaded to scratch, checked for licence, converted and stored in `public/atlas/`. Textures are lazy and disposed, as `FigurePlate` does. Credit and licence are shown on focus. Blocked by: 2.2, 0.1.

### Phase 4: Integration
Verified when: a visitor can go exhibit to atlas and back.
Files: `components/ExhibitPage.tsx`, `app/page.tsx` / `NightMuseum`, `app/robots.ts`, `app/accuracy/page.tsx`.

- **4.1 Deep links (S).** Exhibits that have a landmark get "See it in the atlas". Atlas landmarks link to `/rooms/[era]/[exhibit]`. Blocked by: 2.3.
- **4.2 Sources page (S).** `/accuracy` gains a data-sources section listing each source, licence, attribution and retrieved date from `sources.ts`. This is the one place that attribution lives. Blocked by: 0.1.

### Phase 5: Design record, tests, polish
Verified when: all checks below are green.
Files: `DESIGN.md`, `src/museum/theme.test.ts`, `e2e/atlas.spec.ts`, `components/atlas/*.dom.test.tsx`.

- **5.1 DESIGN.md Atlas section (S).** Record the palette, fonts, lighting, the motion rule (user-driven only) and the confidence-word treatment. Extend `theme.test.ts` so tokens cannot drift. Blocked by: 2.3.
- **5.2 E2E and performance (M).** Playwright covers load, scrub, focus, hash restore, deep links and the no-WebGL fallback. It also runs a frame-time check over 60 rAF samples (the `room-0.spec.ts` pattern), axe, and a CSP assertion with zero blocked requests. Blocked by: 4.1, 3.2.
- **5.3 Review (S).** Run the code-reviewer agent on the diff and the security-reviewer on the snapshot script (file and network). Fix CRITICAL and HIGH findings. Blocked by: 5.2.

Checkpoints: after Phase 1 (data trustworthy), after 2.3 (it feels right), after Phase 4 (shippable).

## Not yet specified
- Phase 2.3: which metric is the default on first load, and the exact entrance camera move. Decided while tuning, inside the stated motion rule.
- Phase 3.2: the actual list of plates. It depends on which files pass the licence check.
- Phase 3.1: **settled.** Six verified markers (OECD AI Principles, NIST AI RMF, Bletchley Declaration, UN A/RES/78/265, EU AI Act, Council of Europe treaty).
- Phase 3.2 (plate wall) is still open. The cheaper route is to reuse the 8 exhibit figures the museum already holds (each already passes the licence validator and is self-hosted), placed on the back wall at their year and linked to their exhibit, before sourcing any new Commons or Archive files. Not built yet.
- Measured on one machine (Intel UHD, dev server, noisy): with 20-face dots the atlas ran 53, 88 and 82 ms a frame; with 80-face dots 93, 193 and 193 ms, so the change is worth about 2x. The existing corridor Room 0 on the same machine read 68.5 and 76.8 ms. So the atlas is in the corridor's band, not clearly faster or slower. No production-build or other-device measurement yet.
- Code review (5.3) found one HIGH and several MEDIUM issues; all fixed: reduced motion left the dots on the old measure after a switch (now a `version` on the blend forces a redraw, logic in tested `src/atlas/blend.ts`); reversing a glide mid-way jumped (now swaps ends); links are now parsed with `URL` and refuse credentials; the zip download streams under a byte cap, refuses redirects and prints its SHA-256; the year slider dims whole years only; the hash follows `hashchange`; table rows use `aria-current` on the button instead of invalid `aria-selected`; the committed snapshot is re-validated by `snapshot.test.ts`.
- Benchmarks (`benchmark_data.zip`) are fog. They are researched after Phase 2 and are not in v1.

## Always / Never
- **Always:**
  - Every mark carries a source URL, a retrieved date, a licence and a confidence word.
  - Read the Next docs under `node_modules/next/dist/docs/` before writing framework code.
  - Keep scene math in pure functions with unit tests (jsdom has no WebGL).
  - Provide the DOM fallback.
  - Honour `prefers-reduced-motion`.
  - Self-host images and data.
- **Never:**
  - No live API calls from the browser, and no CSP loosening.
  - No re-plotting of Stanford AI Index charts.
  - No unlicensed images.
  - No autoplay and no constant rotation.
  - Do not touch the corridor rooms, the DB schema, or the editor.
  - No commits or pushes without being asked.

## Out of scope
Citation/influence constellation (OpenAlex, Semantic Scholar, arXiv), ingesting new exhibits from sources, scheduled refresh via cron, evolution edges, and any change to the corridor rooms.

## Verification (end to end)
1. `npm run atlas:snapshot`, then `npx vitest run`: all green, including `sources`, `build`, `mapping` and `projection` tests.
2. `npm run build`: no CSP or caching errors.
3. `npm run dev`, then open `/atlas`: ~3,700 points. Scrub the year, switch the metric, orbit, click a landmark. Take screenshots at desktop and mobile widths.
4. Emulate reduced motion: camera moves snap, there is no ambient motion.
5. Disable WebGL: the table fallback works by keyboard.
6. `npx playwright test e2e/atlas.spec.ts`: axe clean, frame-time budget met, zero CSP violations.
7. Check that the `/accuracy` sources section lists every source with its licence and date.

## Progress
| Phase | Status |
| --- | --- |
| 0 Probe | done 2026-11-03. Epoch is CC BY 4.0. AIID and AI Index are link-only. EUR-Lex reuse is covered by Decision 2011/833/EU. |
| 1 Data pipeline | done 2026-11-03. 2,498 of 3,706 models plotted. 25 landmarks (7 exhibit-linked, 18 milestones). 27 atlas tests and the full suite (200) pass. |
| 2 Scale scene | done 2026-11-03. One instanced mesh for every plotted model, labelled landmarks, AI-winter bands, orbit and eased focus, metric blend, year dimming, hash deep links, accessible table twin. |
| 3 Governance and plates | 3.1 done: 6 governance markers, each date and link checked against official sources (plan said 10-15; only verified ones shipped). **3.2 plate wall NOT done.** See "Not yet specified". |
| 4 Integration | done. "See it in the atlas" on exhibit pages, nav entry, data-sources section on /accuracy. |
| 5 Design record and tests | done except 5.3 findings, see below. DESIGN.md Atlas section, `theme.test.ts`-style drift test for the Atlas tokens, `e2e/atlas.spec.ts` (7 tests). Full suite 263 passing, project type-checks, production build passes with `/atlas` static. |
