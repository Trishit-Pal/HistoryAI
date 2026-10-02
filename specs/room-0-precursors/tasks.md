# Room 0 tasks

The shipped room uses `precursorsLayout` and a plaque-first hall list. It draws no floor threads. See `spec.md` for the doorway, the single lamp, and the caption wording.

Each task lands a failing test first, then the code that makes it pass. `npm test` and `npm run typecheck` pass before the next task starts. Citation URLs and licenses are copied from `research.md`. They are not invented in the test.

## Task 1 — Test tooling

Failing signal: a jsdom test file cannot resolve `@testing-library/react`, and `npx playwright test` is absent.

- Add `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@axe-core/playwright`, and `@playwright/test`.
- Vitest stays `environment: "node"`. Component tests opt into jsdom with the `// @vitest-environment jsdom` pragma.
- Add `playwright.config.ts` with `webServer` running `npm run dev`, `baseURL` `http://127.0.0.1:3000`, and `testDir: "e2e"`.
- Add script `test:e2e`.
- A smoke component test renders a button and finds it by role. Delete nothing else.

## Task 2 — Figure field

New file `src/domain/figure.test.ts`.

- A figure with license `original`, a `/museum/` src, a source URL, and `redrawnAfter` is stored and returned on the exhibit.
- A second write bumps `version` and the first version blob still has no figure when the first write had none.
- Missing `sourceUrl` fails `invalid-shape` and persists nothing.
- License `copyrighted` fails.
- `kind: "redrawn"` without `redrawnAfter` fails.
- `src` of `https://example.com/a.png` fails.
- `kind: "scan"` without `redrawnAfter` succeeds.

Then add `Figure` to `src/domain/types.ts`, the field on `ExhibitWrite`, and the checks in `validateWrite`.

## Task 3 — Stations

New file `src/museum/precursorsRoom.test.ts`.

- Seven works from 1843, 1854, 1936, 1938, 1943, and two in 1948 come back in that year order. The two 1948 ids follow `KIND_BAND` (idea before system).
- `evt_history_overview` is absent from the stations.
- Terrace 0 is `y: 0`. Terrace 1 is `y: 0.18` and `z: -1.8`.
- Calling the function twice returns deep-equal output.
- An eighth work lands on the next terrace.
- `stationLight(1843)` is `#f2e6c9`. `stationLight(1948)` is `#d5dbe3`.

Then implement `src/museum/precursorsRoom.ts`.

## Task 4 — Seed

Extend `src/seed/eras.test.ts`.

- The eight ids in `spec.md` exist after `seedMuseum`.
- `evt_history_overview` and `evt_1943_mcculloch_pitts` each have `version` 1 on a fresh store (the seed applies each id once; a version bump relative to the old text is the changed public story, not two applies).
- Both technical exhibits have five claim roles, a primary source, `incomplete: false`, and `noPredecessorInScope: true`.
- No exhibit with `startYear < 1943` has `layer: "technical"`.
- Every Era 0 exhibit has a `figure` whose `license` and `sourceUrl` match `ASSETS.md`.
- Context confidence is allowed by `confidenceAllowed`.

Then update `src/seed/eras.ts` and add files under `public/museum/era-0/`. Copy URLs from `research.md`. Do not add an evolution link unless research records a sourced thread.

## Task 5 — Payload

Extend `src/museum/view.test.ts` or add `src/museum/payload.test.ts`.

- `museumNodes` copies `figure` through.

Then update `MuseumNode` and `museumNodes`.

## Task 6 — Dossier and Flatland

New `components/reading.dom.test.tsx` (`@vitest-environment jsdom`).

- Dossier shows the image `alt`, the credit, a link named with "Source", and "Redrawn after" when `kind` is `redrawn`.
- A scan does not show "Redrawn after".
- Flatland for a precursors hall lists the same ids, in station order with the overview plaque first, and the same figure `src` values.

Then update `Dossier.tsx` and `Flatland.tsx`. Flatland order for `era_0_precursors` is the plaque id, then `precursorsStations`. Other halls keep `hall.exhibitIds` order.

## Task 7 — Scene

The scene is Three.js. Do not mount a WebGL canvas in Vitest.

- Export `precursorsCameraY(stationY)` from `precursorsRoom.ts`. Test: `1.6 + y`, and `1.6` when station is null.
- `components/rooms/PrecursorsRoom.tsx` and `components/FigurePlate.tsx` exist and typecheck.
- `HallCorridor` imports `PrecursorsRoom` and uses it for that hall id.
- Reduced motion path in `CameraRig` does not call `gsap.to`. Cover that with a source-level test only if a render test is impossible: a pure `cameraTarget(station, reducedMotion)` is the tested seam, and the component calls it.

## Task 8 — Playwright

`e2e/room-0.spec.ts`.

- Load `/`.
- If the flatland list is present, tab to a precursors exhibit button and open it. The dossier heading is visible.
- axe on `main` or `body` has zero serious or critical violations.
- If a canvas is present, screenshot `e2e/artifacts/room-0.png` and sample animation frames. Average delta above 20 ms fails the test.

## Done

`npm test`, `npm run typecheck`, and `npm run test:e2e` pass. Content verifier and accessibility auditor have run. Room 1 has not started.
