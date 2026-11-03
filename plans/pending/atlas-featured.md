# Atlas: show the 80 most significant models, not 2,498

Ticket: none. On approval, step 0.0 copies this file to `plans/pending/atlas-featured.md` (the previous plan, `plans/pending/atlas.md`, stays as the record of the first build).

## Context

The `/atlas` scene draws every model Epoch AI lists with a date, a link and a metric: 2,498 dots. From 2012 on they pile into one dense cloud, so the landmarks and the story get lost. You asked for the 80 most relevant and impactful points instead.

What the data supports (checked against the real file, 2026-11-03):
- Citation counts exist for 1,115 models (111 have 10,000 or more).
- Epoch tags each model with a notability reason: SOTA improvement (458), Highly cited (239), Historical significance (108), Training cost (73), Discretionary (59), Significant use (39).
- 123 models are flagged frontier and 70 foundation.
- 37 models set a new record for training compute when they appeared.

A prototype of the selection (read-only, in Python) ran against this data and gave a usable 80. It also showed four traps the design must handle:
1. **"Frontier" is noise before about 2010.** Obscure 1960s rows are tagged "frontier at the time". The bonus only counts from 2012.
2. **The newest models lose on citations**, because they have none yet. Grok 4, GPT-4.5, Gemini 1.0 Ultra and Claude 3.5 Sonnet need a rule that protects them.
3. **Variants of one paper crowd in** (Llama 2-7B and 70B share a paper, and so do two NPLM rows). Only the best-scoring row per paper may be picked.
4. **An overlap rule is needed**, or the picks re-form the cluster. But a naive version drops compute record-setters, which are the models that trace the exponential.

## Decisions (from your answers)

| Decision | Chosen | Why |
| --- | --- | --- |
| How the 80 are chosen | Scored, with guardrails | Committed, tested, and re-runs the same way on a data refresh. |
| The other ~2,400 | Hidden by default; a "Show all models" switch brings them back | Keeps the default clean and the "N of 3,706" claim checkable. |
| Spread over time | Guaranteed minimum per era, impact decides within each | A history museum's story needs the early decades. |
| Signals | Compute record-setters, citations, Epoch notability tags, frontier and foundation flags | All four selected. |

## Assumptions: correct me now or I proceed

1. **The editorial override list (my addition).** The score cannot be trusted alone for the recent frontier, so `mapping.ts` gets a short `PINS` list (always shown) and `EXCLUDES` list (never shown). Pins start as the 25 current landmarks plus a few recognisable recent models (Gemini 1.0 Ultra, GPT-4.5, Grok 4, Claude 3.5 Sonnet, GPT-5, Llama 3.1 405B, subject to those exact names existing in the data). After the run I print the final 80 so you can edit the two lists. Nothing blocks on that.
2. **Every non-pinned pick needs a compute estimate**, so the default view is dense enough. Deep Blue is pinned and has parameters only, so it appears in the Parameters view.
3. **Record-setters are thinned**: a model counts only if it beats the previous compute record by 0.3 in log10 (about 2x), so near-ties do not fill the 80.
4. **Era floors are minimums, not promises**: early eras take what exists (1950 to 1956 has almost nothing).
5. **Labels**: exhibit-linked models are always labelled. Every other featured model is labelled when the camera is close, and in the details panel on hover. This keeps the many labels from re-creating the clutter.
6. **The table twin becomes the 80 featured models** (with a "Why it is here" column), replacing the 25-row landmark table. Deep links (`#model=`) work for any featured model.
7. **One new constant, `FEATURED_COUNT = 80`.** If the pins and records alone ever exceed 80 the build fails loudly rather than quietly drop some.

## Selection rule (build time, committed, tested)

In `src/atlas/select.ts`, run by `buildAtlas`:
1. **Eligible**: plotted rows with a compute estimate (pins are exempt), minus `EXCLUDES`.
2. **Always in**: `PINS`, then the thinned compute-record envelope.
3. **Era floors** over Epoch's ten post-1949 eras: 2, 4, 2, 3, 3, 6, 9, 9, 11 and 14 from oldest to newest, filled by score.
4. **Fill to 80 by score**, skipping any candidate that would overlap an already chosen point (within about 4 months and 0.7 log10 on the plot), and any second row of the same paper (matched on Epoch's `Reference`).
5. **Score** = compute record 1.0, plus citations up to 1.2 (log scale), plus notability tags (Historical significance 0.5, Significant use 0.6, Highly cited 0.3, Training cost 0.2, SOTA improvement 0.15, Discretionary 0.05), plus frontier 0.6 and foundation 0.4 (both from 2012 only).
6. Each featured model gets a short `why` list ("compute record", "98k citations", "historical significance", "landmark") that the panel shows as "Why it is here".

The weights are named constants in one place. The thresholds above are starting values to tune against the printed list.

## Phases

### Phase 0: Setup
Verified when: the repo plan is in place.
- **0.0 (XS).** Copy this plan to `plans/pending/atlas-featured.md`. Blocked by: none.

### Phase 1: Selector (data only, fully testable without WebGL)
Verified when: `npm run atlas:snapshot` writes a snapshot with exactly 80 featured models and the tests pass.
Files: `src/atlas/select.ts` and `select.test.ts` (new), `src/atlas/mapping.ts` (add `PINS`, `EXCLUDES`), `src/atlas/build.ts`, `src/atlas/types.ts`, `src/atlas/snapshot.test.ts`, `data/atlas-snapshot.json`.

- **1.1 Selector (M).** Pure `selectFeatured(candidates, options)` returns the chosen indices and their `why` lines. Test seam: `select.test.ts` with small synthetic fixtures, covering each rule in turn. Acceptance: pins are always in; a record-setter is always in; era floors hold when data exists; two overlapping points never both appear unless one is pinned; two rows of one paper never both appear; the count never exceeds 80 and fails loudly if pins plus records do. Verify: `npx vitest run src/atlas/select.test.ts`. Blocked by: 0.0.
- **1.2 Wire into the build (S).** `buildAtlas` reads the extra Epoch columns it needs (Citations, Notability criteria, Frontier model, Foundation model, Reference), calls the selector, and adds two columns to the snapshot: `featured` and `why`. All 2,498 rows stay in the snapshot (the "Show all" switch needs them). Citation and notability inputs are used at build time only and are not shipped. Blocked by: 1.1.
- **1.3 Regenerate and check the data (S).** Re-run `npm run atlas:snapshot`, then extend `snapshot.test.ts`: exactly 80 featured, every pin featured, every featured has at least one `why`, column lengths equal. Print the 80 (name, date, compute, why) into the report. Verify: `npx vitest run src/atlas`. Blocked by: 1.2.

### Phase 2: Scene and panel
Verified when: the default view shows 80 dots with the cluster gone, and the "Show all models" switch restores the rest.
Files: `components/atlas/{PointCloud,LandmarkLabels,AtlasShell,AtlasPanel,AtlasTable}.tsx`, `src/atlas/{describe,projection,landmarks}.ts` and their tests, `app/atlas/atlas.css`.

- **2.1 Visibility rule (S).** In `instanceState`, a non-featured point is hidden unless "Show all" is on. When on, it draws small and dim (reusing the dim mechanics), and featured points keep full size. Test seam: `projection.test.ts` (pure). Blocked by: 1.3.
- **2.2 Point cloud and labels (M).** `PointCloud` passes the new inputs into `instanceState` and recolours on the switch. `LandmarkLabels` labels every featured model: exhibit-linked always, the rest near the camera only, reusing the existing distance rule and stagger. Blocked by: 2.1.
- **2.3 Panel (S).** A "Show all models" switch (an `aria-pressed` button, same style as the measure buttons). Coverage line becomes: "Showing the 80 most significant of 2,498 models Epoch AI lists with a {figure}. Turn on 'Show all models' to see the rest." The details block gains a "Why it is here" line from `why`. Blocked by: 1.3.
- **2.4 Table twin and hash (M).** The landmark table becomes a table of the 80 featured models with a Why column. The URL hash works for any featured model, not only landmarks. Exhibit links stay for the 7 exhibit-linked ones. Verify: `npx vitest run components src/atlas`. Blocked by: 1.3.

### Phase 3: Verification and record
Verified when: all checks below are green and the old behaviour is confirmed gone.
Files: `e2e/atlas.spec.ts`, `DESIGN.md`, `plans/pending/atlas-featured.md`.

- **3.1 E2E (S).** Update the row counts (80 featured rows), and add tests: the switch changes the coverage text and keeps the table at 80; a hash for a non-landmark featured model focuses it; the no-WebGL fallback still shows the table. Blocked by: 2.4.
- **3.2 Before and after (S).** Screenshots of the default view before and after, plus the same view with "Show all" on, so the cluster reduction is visible. Also a frame-time sample. Blocked by: 2.2.
- **3.3 Docs and review (S).** DESIGN.md Atlas section (the 80, the switch, the Why line, label rule). Run the code-reviewer agent on the changed files only (the list is named, since the repo has many unrelated changes) and fix confirmed issues. Blocked by: 3.1, 3.2.

Checkpoints: after 1.3 (are these the right 80?), after 2.2 (does the cluster read clearly?).

## Not yet specified
- The final 80 depends on the thresholds above. They are tuned against the printed list in 1.3. If the list needs a name added or removed, that is an edit to `PINS` or `EXCLUDES`, not a code change.
- Phase 3.2 of the first plan (the plate wall of portraits and scans) is still not built and is not part of this change.

## Always / Never
- **Always:**
  - The selection is deterministic, constants are named in one place, and every featured model can say why it is there.
  - Missing values stay null, never invented.
  - Keep reduced motion, the DOM table, and the no-WebGL fallback working.
  - Say "80 of 2,498" in the page copy, so nothing is hidden silently.
- **Never:**
  - No hand-edited snapshot data (it is regenerated by the script, and `snapshot.test.ts` checks the file).
  - No new dependencies.
  - Do not touch the corridor rooms, the DB, the editor, or the unrelated files already modified on the branch.
  - No commits or pushes without being asked.

## Out of scope
The plate wall of figures, new data sources, the pre-existing findings from the last code review (rate limiting, editor, changelog), any change to Epoch's licence handling, and moving the selection to run in the browser.

## Verification (end to end)
1. `npx vitest run`: the selector, snapshot and projection tests pass with the rest of the suite.
2. `npx tsc --noEmit`: clean.
3. `npm run atlas:snapshot`, then check the report's printed list of 80: it contains the 25 pins, the compute record envelope, and at least the era floors, with no two overlapping dots.
4. `npm run dev` and open `/atlas`: the default shows about 80 dots, labelled landmarks, and the "Why it is here" line on hover; "Show all models" brings back the rest. Take screenshots before and after, at 1440x900, with reduced motion on (the camera snaps, so the screenshot is reliable) and once without.
5. `npx playwright test e2e/atlas.spec.ts`, plus the existing home, exhibit and CSP specs. If a dev server from an earlier run is still listening, stop it first, and do not run `npm run build` while one is up.
6. `npm run build`: `/atlas` still prerenders as static.

## Progress
| Phase | Status |
| --- | --- |
| 0 Setup | done 2026-11-03 |
| 1 Selector | done. `select.ts` (17 tests), wired into `buildAtlas`, `PINS` (25 landmarks + 6 recent) and `EXCLUDES` (2) in `mapping.ts`, snapshot regenerated with exactly 80 featured, `snapshot.test.ts` checks the file. |
| 2 Scene and panel | done. Non-featured dots hidden unless "Show all models", then small and faint; labels cover every featured model; coverage sentence and "Why it is here" line; table is the 80 with reasons; hash works for any featured model. |
| 3 Verification and record | done. Full suite 325 passing, project type-checks, 20 e2e passing (atlas, CSP, exhibit, navigation), production build passes with `/atlas` static. Screenshots confirm the cluster is gone and "Show all" restores it. DESIGN.md updated. |

Review (3.3) found 3 HIGH and 2 MEDIUM issues, all confirmed and fixed: (1) paper de-duplication could drop a whole paper or its record-setting row when the best-scoring row was excluded or had no compute, and ties kept the smaller model. It now keeps a showable row, never drops a pin, and prefers the larger model on a tie (the regenerated 80 swaps KN-LM for SB-LM, the 2007 compute record, and GLM-130B for SPPNet). (2) Hidden labels could take a click meant for the dot beneath; the handler now ignores a hidden label. (3) Turning "Show all" off left the panel and camera on a hidden dot; it now clears them (`isDrawn`, tested). Tests added for each. Left as is: the era-floor check in `snapshot.test.ts` can only fail falsely, never pass wrongly. A future Epoch refresh plus the 31 pins could push records over 80 and fail the build loudly; raise `RECORD_STEP` if that happens.
