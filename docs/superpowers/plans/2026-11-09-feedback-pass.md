# Feedback pass: Timeline 1980–1993, Atlas wayfinding, Globe ranking

## Context
A reviewer gave feedback on three pages:
- **Timeline (home `/`):** it shows the First AI winter, so readers expect the second. The expert systems boom, the second winter and backpropagation need coverage.
- **Atlas (`/atlas`):** hard to find a starting point. The reviewer asked for a clearer default view, more prominent axis labels and legend, instructions for rotate, zoom and select, and preset views or a reset.
- **Globe (`/globe`):** hard to judge how big the gaps between countries are. The reviewer asked for a ranked bar chart for the selected year and a clear statement of what is being compared.

What the code shows today:
- **Timeline:** the 1980–1993 gap is deliberate. `era_4_expert_systems` and `era_5_second_winter` (`src/domain/eras.ts:31-38`) have no exhibits, so they have no band. Their earlier exhibits (`evt_1985_expert_spend`, `evt_1987_lisp_collapse`) were withdrawn for weak sources (`src/seed/withdrawn.ts:76-122`).
- **Atlas:** it already has Front/Top/Side presets, a "Back to the whole plot" reset and model stepping (`components/atlas/AtlasPanel.tsx`). They sit low in the side panel. The page lacks visible instructions, an HTML legend, and titles on the year and domain axes (only the height axis is titled, `PlotFrame.tsx:76-85`).
- **Globe:** no chart library is installed, and the spec forbids new runtime dependencies. Per-country counts are computed inline in three places, e.g. `GlobeTable.tsx:32`.

Decisions from the interview:
- New exhibits meet the **same sourcing bar**: `confirmed`, `officialPrimary`, and 2 or more hostnames. A "winter" is shown through documented events plus the room summary, never as an event itself.
- Timeline scope is **Expert systems boom, Second AI winter, Backpropagation 1986**. The rise of statistical ML is out of scope for this pass.
- New exhibits get **no artefacts** for now.
- Atlas gets an **always-visible key and an HTML legend**. Nothing to dismiss.
- Globe bars show **cumulative counts on a linear scale**, every bar labelled with its number, placed **beside the globe** in the side column. Clicking a bar selects the country. The table below re-sorts by rank with the same bars inline.

Branch `feature/feedback-pass` off `origin/main`, with one PR into `main`. Before any code, write the design doc `docs/superpowers/specs/2026-11-09-feedback-pass-design.md` and the plan `docs/superpowers/plans/2026-11-09-feedback-pass.md`, following the frontier-globe docs as the template.

## Part A — Timeline: 1980–1993 (research-gated)

**A1. Research, with an approval gate (no code).** For each candidate, find one official or primary source plus a second hostname. Drop any candidate that fails. Then present the shortlist with its URLs to the user for approval before seeding.

| Era | Candidates (ids follow the `evt_YYYY_slug` pattern) |
|---|---|
| era_4 Expert systems boom (1980–87) | R1/XCON at DEC (McDermott, AAAI-80); Japan's Fifth Generation Computer Systems project (1982, ICOT); DARPA Strategic Computing (1983 report); UK Alvey programme (1983) |
| era_4 (by year) | **Backpropagation**: Rumelhart, Hinton & Williams, *Nature* 323 (1986), with the PDP volume as the second source. Technical layer. |
| era_5 Second AI winter (1987–93) | Documented events only, e.g. the FGCS'92 final conference and close of the Fifth Generation project, or Strategic Computing's wind-down. Do not revive the withdrawn ids. |

Rules (follow `docs/accuracy-audit-2026-11.md` and the `src/seed/eras.ts` helpers `c()`, `audited()` and `changed()`):
- `fieldChange.citationUrls` must be a subset of the exhibit's own citations.
- Caveats go in `editorialNote`.
- Wording follows the "X's paper says…" style.
- No Wikipedia or secondary histories as primaries.

**A2. Seed.** Create `src/seed/eighties.ts` and spread it into `SEED_NODES`, the same way `frontier.ts` is.
- Set `eraId` explicitly on every exhibit. It wins in `layout.ts:150`. This matters for boundary years: `eraForYear(1980)` returns era_3 even though R1/XCON belongs in era_4.
- Add a neutral `summary` to era_4 and era_5 in `src/domain/eras.ts`, backed only by their new exhibits, and remove the "no exhibits" comments.
- If no era_5 candidate passes, era_5 stays hidden and gets no summary. Say so rather than weakening the bar.

**A3. 3D room spots.** `src/museum/eraRooms.ts:35-41` gives `expert` and `secondWinter` one spot each. Any extra exhibit falls back to `[0,0,-1.2-1.6i]` (`:7`), which puts it behind the counter or past the back wall.
- Size each spot array to the approved shortlist, following `ExpertSystemsRoom.tsx` and the second-winter room's geometry.
- Add a sightline test like `src/museum/roomBoxes.test.ts:115`.

**A4. Fallout.**
- Flip the "no band" assertion in `src/seed/eras.test.ts` (~:152-169) to expect the bands.
- Flip the "no summary" assertion for era_4 and era_5 in `src/domain/halls.test.ts:34-36`.
- In `e2e/era-rooms.spec.ts:47-56`:
  - the 404 expectation becomes 200;
  - the band count at `:53` changes;
  - "Next era" after the first winter at `:55` becomes "Expert systems boom";
  - split the `:48` loop if era_5 stays hidden.
- Update the copy at `app/accuracy/page.tsx:26`.
- Leave the withdrawn count (eight) unchanged.
- Regenerate `data/museum-snapshot.json` with `npm run snapshot`.
- **Live database:** you run `npm run db:audit -- --dry-run` and then `npm run db:audit`, which applies `SEED_NODES` (`src/server/audit.ts:95`, per the frontier spec). Do not use `db:seed`.
- The Atlas winter bands read `ERAS`, so they are unaffected.

## Part B — Atlas: say where to start

**B0. Layout wrapper.** `.atlas-stage` is a two-column grid, and the hint is its first child. The hint stays out of flow today only because `.sr-only` is absolute (`atlas.css:48-50`, `AtlasShell.tsx:174`).
- Wrap the canvas, toolbar, how-to and legend in one column div, `.atlas-plot` (`position: relative`). The aside stays in column 2.
- `AtlasShell.tsx` is already 249 lines, so it only gains that wrapper and two component tags.
- New styles go in `app/atlas/atlas-legend.css`, because `atlas.css` is already 293 lines.

**B1. Visible how-to.** Turn the screen-reader-only `#atlas-keys-hint` (`AtlasShell.tsx:174-176`) into a visible line under the canvas: "Drag to turn the plot, scroll or pinch to zoom, select a dot for its details. With the plot focused, the arrow keys step between models." Keep the id so `aria-describedby` still works.

**B2. Views on the plot.**
- Move the "View from" fieldset and the reset button out of `AtlasControls` into an `AtlasViews` export in `AtlasPanel.tsx`, which makes `AtlasControls` shorter.
- Render it as a **sibling after** `.atlas-canvas`, absolutely positioned in the top corner of `.atlas-plot`. It must not sit inside the `role="application"` div: there, arrow keys on a focused button would bubble up to `stepFromKey`.
- OrbitControls listens only on the canvas (`CameraRig.tsx:112`), so the overlay does not fight it.
- Show the toolbar only when `webgl === true`. `canView` is true while the scene is still loading, so it is not enough.
- Keep the button names unchanged so `e2e/atlas.spec.ts:93-115` still passes.

**B3. HTML legend** (`components/atlas/AtlasLegend.tsx`), under the canvas next to the how-to. It shows:
- **Axes:** left to right is publication year; height is the current metric title; rows are domains.
- **Domain swatches** from `laneColour(lane)` with `atlas.domains` names.
- **Dot states:** normal, dimmed after the year cutoff, and muted ("Show all").
- **The winter band.**

Move `AXIS_TITLE` (`PlotFrame.tsx:16`) and `METRIC_LABEL` (`AtlasPanel.tsx:10`) into `src/atlas/format.ts` so the legend, the panel and the 3D title share them.

**B4. Axis titles in 3D.** In `PlotFrame.tsx`:
- Add a "Publication year" title under the year ticks.
- Add a "Domain" title above the lane names.
- Raise the title size above `TICK_SIZE` (0.7). The target is about 0.9; confirm by screenshot.

The default camera (`restPose`) stays as it is. The legend and on-plot views are the "clearer default".

## Part C — Globe: ranked bars beside the globe

**C1. Data, counted in one place.** Add these to `src/globe/stats.ts`:
- `countAt(country, year)`, which replaces the three inline counts in `Columns.tsx:36`, `GlobeTable.tsx:32` and `GlobePanel.tsx:56`. Column heights and bar lengths can then never disagree.
- `rankAt(countries, year)`, which ranks **every** country: count descending, then first date, then name.

Test both in `src/globe/stats.test.ts` with a zero year, ties, and a shared model counting for both countries.

**C2. `components/globe/GlobeRanking.tsx`**, rendered in `.globe-side` between `.globe-controls` and `CountryPanel` (`GlobeShell.tsx:143-145`). It shows `rankAt(...).filter(count > 0)`.
- **Heading** states the comparison: "Models trained with at least 10<sup>{snapshot.threshold}</sup> FLOP, by lab country, {byYear(year)}". Do not hard-code 23.
- **Each row** is a `<button aria-pressed onClick={select}>` holding the name, a bar and the count. The leader is the top count for that year, and the scale is linear.
- **Footnote:** "A model from labs in two countries counts for both."
- **Accessibility:** this is a list of buttons, and the table stays the full screen-reader route.
- **Shared `Bar` span** (`components/globe/Bar.tsx`): `style={{"--share": count/leader}}`, following the `ArtefactDial.tsx:77` pattern. The ranking and the table both use it.

**C3. Table.** `GlobeTable` uses `rankAt` order directly, so there is no separate list of countries not yet reached to merge in. It adds the `Bar` beside the count and keeps the "First" column.

**C4. Layout, copy and CSS.**
- **Side column.** `.globe-side` is capped at `min(78vh,52rem)` with no overflow rule (`globe.css:85-91`). Up to 23 rows would crush the panel.
  - The ranking gets `flex: 0 1 auto; min-height: 0; overflow-y: auto`.
  - `.globe-panel` becomes `flex: 1 0 18rem`, so with a country selected both stay usable and the ranking scrolls.
- **Copy:** update `SCENE_LABEL` to point to the ranking.
- **Styles** go in a new `app/globe/globe-ranking.css`, using the `--bp-*` tokens, the gold bar and the chalk numbers.
- **Mobile:** the ranking sits under the slider, and the panel stays the bottom sheet. Check both together at 390×844.

**C5. Fix the Globe e2e locators.** `e2e/globe.spec.ts:51,106,117` use `getByRole("button", { name: "United Kingdom" })`. That match is a substring match, so it will also hit the ranking button. Scope those locators to `.globe-table`.

## Order of work
1. Write the spec and plan docs.
2. Part C (Globe) and Part B (Atlas). They are independent code with no research dependency.
3. Part A1 research, then **stop for the user's approval of the exhibit shortlist**.
4. A2–A4.
5. The PR into `main`. You run `db:audit` after the merge.

Keep every new file under about 200 lines.

## Verification
- `npm test` (the full parallel Vitest run, as CI does it) and `npm run typecheck`.
- `npx playwright test --workers=1` for `atlas`, `globe`, `era-rooms` and `csp`. The axe scans must show no serious or critical violations.
- Add assertions:
  - Globe: ranking rows change with the year, and a click selects the country.
  - Atlas: the how-to and legend are visible, and the toolbar buttons work.
  - Era rooms: `/rooms/expert-systems` returns 200, and every exhibit spot passes the sightline test.
  - Atlas: arrow keys on a focused toolbar button do not step the model.
- Screenshots of `/`, `/atlas` and `/globe` at 1440×900 and 390×844. Review legibility of the 3D axis titles and the bar slivers for 1-model countries.
- Run the app with `npm run dev`. Scrub the globe year from 2018 to 2026, check the leader changes, and confirm the counts match the table.
