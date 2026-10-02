# Room 0 technical plan

Scope is this room only. The store, era list, confidence rules, and palette stay as they are. Citations and figure licenses come from `research.md` and `public/museum/era-0/ASSETS.md`. If research marks a row blocked, that exhibit is not seeded until the block is resolved.

## Approach

Add an optional `figure` on the exhibit write. Validate it. Seed eight Era 0 records through the existing editor `apply` path, with per-node `layer` instead of a hardcoded context layer. Compute terrace stations in a pure function. Mount a stepped-hall scene only for `era_0_precursors`. Show the same figure on the dossier and in Flatland.

## Files

- `src/domain/types.ts` — `Figure` and `FigureLicense`.
- `src/store/memory.ts` — optional `figure` on `ExhibitWrite`. The version blob already clones the exhibit, so the field rides along.
- `src/domain/validator.ts` — reject a figure with a missing license, an unknown license, an empty `sourceUrl`, a `src` that does not start with `/museum/`, or `kind: "redrawn"` without `redrawnAfter`.
- `src/seed/eras.ts` — `layer` on `SeedNode`. `toWrite` passes it through and defaults to `context` only when the node omits it. Replace the two Era 0 nodes and append the six new ones. Technical canon nodes are written with claims, sources, supports, and `noPredecessorInScope` in a second `apply` if a single exhibit write cannot carry claims today. It can: `Write` already has `claims`, `sources`, and `supports`. `seedMuseum` must pass those through for nodes that have them.
- `src/museum/payload.ts` and `src/museum/view.ts` — copy `figure` onto `MuseumNode`.
- `src/museum/precursorsRoom.ts` — `precursorsLayout` and `stationLight`. `layoutHalls` puts the entrance plaque first, and that list is the only order. Room 0 draws no floor threads. One lamp follows the focused exhibit and stops at 8 metres. Confidence is checked on every layer against the merged record, and an exhibit cannot change layer.
- `components/rooms/PrecursorsRoom.tsx` — terraces, risers, walls, brass hall name, doorway, entrance plaque.
- `components/FigurePlate.tsx` — texture and id.
- `components/HallCorridor.tsx` — branch on hall id; camera uses terrace height.
- `components/Dossier.tsx` and `components/Flatland.tsx` — figure block.
- `public/museum/era-0/` — SVG redraws, any public-domain scans, `ASSETS.md`.
- `e2e/room-0.spec.ts` and `playwright.config.ts`.

## Station math

`precursorsStations` drops `evt_history_overview`, sorts the rest by start year then `KIND_BAND` then id, and returns `{ id, index, y: index * 0.18, z: -index * 1.8 }`. The plaque sits at `{ y: 0, z: 1.8 }`, in front of terrace 0. Room length is `3.6 + count * 1.8`.

`stationLight(year)` mixes `#f2e6c9` at 1843 toward `#d5dbe3` at 1948. Years outside that span clamp.

## Canon writes

`evt_1943_mcculloch_pitts` and `tech_1948_shannon_information` use `layer: "technical"`, both stories, five claims, one `paper` source each, support links, `incomplete: false`, and `noPredecessorInScope: true`. No evolution link is written unless `research.md` names a sourced thread.

Context nodes stay `layer: "context"`. Confidence follows `confidenceAllowed`. A single official URL plus one other domain may be `confirmed` with `officialPrimary: true`. Otherwise `reported`.

## Scene mount

`Corridor` already loops halls. When `hall.id === "era_0_precursors"`, it renders `PrecursorsRoom` instead of the flat floor and side walls. Monuments use station positions from `precursorsStations`, plus the plaque position for the overview id. Other halls keep `pedestalPosition`.

`CameraRig` looks up a station for the focused id. Eye height is `1.6 + station.y` in Room 0 and `1.6` elsewhere. Reduced motion assigns `camera.position` and does not tween.

`FigurePlate` uses drei `useTexture` only when `load` is true. The corridor passes `load` for the focused station and its two neighbors.

## Tests

Node tests do not render Three.js. Component tests render Dossier and Flatland in jsdom and mock nothing about the store. Playwright runs the Next dev server, walks keyboard focus on `/`, runs axe, and samples `requestAnimationFrame` deltas. The frame sample fails if the average exceeds 20 ms. A missing WebGL context skips the frame assertion and still runs axe and the keyboard path via Flatland.

## Out of scope

Postgres, search, later rooms, and changing decade-room tests. `layoutRooms` is untouched.
