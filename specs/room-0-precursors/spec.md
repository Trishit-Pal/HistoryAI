# Room 0: Precursors

A stepped hall for everything the museum places through 1949. The architecture is hand-authored. Which exhibit stands on which terrace, the order, the threads, and year sealing still come from the data.

This spec is the contract for this room only. It does not change the graph rules, the era list, the confidence rules, or the locked palette.

## Source of truth

The named master spec and implementation prompt are not in the repo. Until they are, this room follows:

- `docs/superpowers/specs/2026-09-26-ai-knowledge-architecture-design.md` for the graph, publication rules, and gallery contract.
- The museum spec merge for eras, the context layer, and confidence.
- `PRODUCT.md` and `DESIGN.md` for color, type, and reading rules.

If those named documents appear, this spec is rechecked against them before further rooms.

## Purpose

A visitor enters the earliest hall and climbs one terrace per exhibit, from the entrance plaque to a doorway that opens onto Formal founding (1950). Each terrace carries a sourced figure. The reading plate and Flatland show the same exhibits.

## Non-goals

- No redesign of the store, the era ids, or the canon rules.
- No `book` source kind. A book stays a context exhibit with citations.
- No years before 1943 on the technical layer.
- No invented predecessor threads. A thread exists only when a cited source states the relationship.
- No accounts, portraits of living people, scraped photos, or a second renderer.
- No change to rooms after Room 0 except the mount point that lets this room replace the shared hall for `era_0_precursors`.

## Exhibits

Eight records, seven terraces of history plus the entrance plaque. The plan calls this the lean lineage of seven items; the plaque is the eighth record and is not a terrace of a single work.

Pre-1943 records are `layer: "context"`. The technical layer rejects a start year before 1943. Wiener stays context because the schema has no book source kind.

| id | year | layer | state | work |
| --- | --- | --- | --- | --- |
| `evt_history_overview` | 1854 | context | canon | Entrance plaque. Existing id. Version bump replaces the Wikipedia-only citation. |
| `ctx_1843_analytical_engine` | 1843 | context | canon | Menabrea, sketch of the Analytical Engine, with Lovelace's notes, Taylor's *Scientific Memoirs*, 1843. |
| `ctx_1854_boole_laws_of_thought` | 1854 | context | canon | Boole, *An Investigation of the Laws of Thought*, 1854. |
| `ctx_1936_turing_computable` | 1936 | context | canon | Turing, "On Computable Numbers", *Proceedings of the London Mathematical Society*, 1936–37. |
| `ctx_1938_shannon_switching` | 1938 | context | canon | Shannon, "A Symbolic Analysis of Relay and Switching Circuits", *Transactions of the AIEE*, 1938. |
| `evt_1943_mcculloch_pitts` | 1943 | technical | canon | Existing id, promoted. McCulloch and Pitts, *Bulletin of Mathematical Biophysics*, 1943. |
| `ctx_1948_wiener_cybernetics` | 1948 | context | canon | Wiener, *Cybernetics*, 1948. |
| `tech_1948_shannon_information` | 1948 | technical | canon | Shannon, "A Mathematical Theory of Communication", *Bell System Technical Journal*, 1948. |

The two existing ids do not change. A second publish bumps `version` and keeps the first blob.

### Context exhibits

Each context exhibit has a title, kind `idea`, a public story, at least one literal citation URL, a confidence the sources allow, `eraId: "era_0_precursors"`, and a figure. Confidence is `confirmed` only when one citation is an official primary and a second citation is on an independent domain. Otherwise the ceiling is `reported`.

The entrance plaque's public story stays a framing sentence about documented precursors. It does not assert a technical lineage the sources do not state.

### Technical canon exhibits

`evt_1943_mcculloch_pitts` and `tech_1948_shannon_information` each have:

- a public story and a technical account
- `incomplete: false`
- all five claim roles: `what_changed`, `capability`, `limit`, `failure`, `unknown`
- a primary source on every claim (`paper` or `technical_report`)
- `noPredecessorInScope: true`, unless research finds a cited evolution link to another exhibit already in the museum

A failure claim may have status `unknown` when the sources do not establish a technical failure. It still cites a primary source.

Seed writes go through the existing editor path. `toWrite` must stop forcing `layer: "context"` on every node. Each seed node carries its own layer.

## Figures

One optional `figure` on an exhibit write. The store, the public read, and the version blob keep it.

```ts
type FigureLicense =
  | "PD-old"
  | "PD-US-expired"
  | "CC0-1.0"
  | "CC-BY-4.0"
  | "CC-BY-SA-4.0"
  | "original";

type Figure = {
  src: string;
  alt: string;
  credit: string;
  license: FigureLicense;
  sourceUrl: string;
  kind: "scan" | "redrawn";
  redrawnAfter?: string;
};
```

The validator rejects a figure when:

- `license` is missing or outside the allowlist
- `sourceUrl` is missing or empty
- `kind` is `redrawn` and `redrawnAfter` is missing
- `src` does not start with `/museum/`

A scan is a public-domain or CC file fetched from the logged URL. A redraw is an original SVG made for this room, labeled in `credit` as redrawn after the cited source. Redraws use `license: "original"`.

Every Room 0 figure is also a row in `public/museum/era-0/ASSETS.md`: file, license, source URL, author or "original", and retrieval date. Textures are 1024 px on the long side or smaller. SVG redraws stay vectors.

Room 0 exhibits all have a figure. The field stays optional on the write model so other rooms are unchanged.

## Room

`layoutHalls` puts `evt_history_overview` first in this hall. The rest stay in year order. That list is the reading order, the Earlier/Later order, and the order used on entry.

`src/museum/precursorsRoom.ts` exports `precursorsLayout(exhibitIds)`. It does not sort.

- The plaque, when present, sits at x 0, y 0, z 1.8.
- Each following id is a terrace. Terrace `n` is at x `((n % 2) * 2 - 1) * 1.2`, y `n * 0.18`, z `-n * 1.8`.
- The same ids always return the same spots.
- An extra id takes the next terrace. The room length grows.

`components/rooms/PrecursorsRoom.tsx` draws, for that hall only:

- a stone floor on each terrace
- a riser between terraces
- side walls
- the hall name "Precursors" in brass above the first riser, clear of the stone
- a doorway at the far end, on a floor at the height of the last terrace
- a click on that floor enters the next hall, unless that hall is sealed, in which case the label reads "Opens" and the year
- the entrance plaque at the foot, with its figure plate

`components/HallCorridor.tsx` mounts `PrecursorsRoom` when `hall.id === "era_0_precursors"`. Every other hall stays on the shared corridor. Room 0 draws no floor threads. The shared thread helper links every adjacent pair, which would invent relationships this room does not claim.

One lamp follows the focused exhibit. Its colour runs from `#f2e6c9` at 1843 to `#d5dbe3` at 1948, and its reach stops at 8 metres so it does not light later halls. `stationLight` is the tested function.

Colors stay floor `#1A1814`, stone `#C8BBA4`, brass `#A6843D`, ink `#1E2430`, zinc `#E4E7EA`. Fonts stay Syne, Literata, and IBM Plex Mono. Brass is not small text on zinc.

## Figure plate

`components/FigurePlate.tsx` is a mesh in front of the monument shaft. It shows the figure as a texture and the exhibit id in IBM Plex Mono on the plate. A texture loads when that pedestal is the focused one or an immediate neighbor in station order, not for the whole museum at once. A missing file leaves the zinc plate and the id, and does not throw.

## Camera and motion

`CameraRig` uses the focused station's terrace height when the focused exhibit is in Room 0. Otherwise it keeps the current eye height of 1.6 m above the floor. Reduced motion sets the camera position in one assignment and does not call `gsap.to`. Other halls keep their current ease.

## Reading surfaces

`Dossier` shows, when the node has a figure:

- the image with its `alt`
- the credit
- the license in plain words, and a link named "Source:" plus the publisher, with no raw URL in the caption
- the phrase "Redrawn after" plus the `redrawnAfter` URL when `kind` is `redrawn`

`Flatland` lists the same exhibit ids as the hall, in station order, including the entrance plaque, and shows the same figure block. A unit test asserts the id set and the figure `src` values match.

## Accessibility

- Keyboard moves between halls that the year rail has not sealed, through the existing hall controls.
- Inside Room 0, Tab reaches the dossier, the figure link, and the earlier/later controls. The 3D canvas is not the only path to an exhibit.
- Focus rings stay visible.
- Reduced motion snaps the camera.
- Flatland is used when WebGL is missing.
- Plate body text is ink `#1E2430` on zinc `#E4E7EA`.
- Figure `alt` describes the diagram, not the file name.

## Performance

- WebGL2 path.
- Textures at most 1024 px.
- Room 0 plus the next hall are the meshes kept lit. This room does not load later-era textures.
- Target: 60 frames per second at 1920 px on the WebGL2 path, and the first terrace interactive within a second of the scene data arriving. The Playwright check records frame time and fails above 20 ms average over a one-second sample after load. If the machine cannot hold that, the test records the number and the review says so; it does not lower the target in the spec.

## Tests

- Vitest, node environment: figure validation, station order, terrace height, light endpoints, seed canon completeness, Flatland id parity.
- Vitest, jsdom, Testing Library: dossier figure block, Flatland figure block, license link.
- Playwright with axe: keyboard path from the hall control into the dossier and out through the next hall chip, no serious or critical axe violations on `/`, a screenshot of the canvas, and the frame-time sample.

## Definition of done

- The eight records above are seeded. Each citation URL was opened during research or verification. The two technical exhibits pass canon completeness.
- Each of the eight has a figure whose license, URL, and author are in `ASSETS.md`.
- The stepped hall renders on WebGL2. Flatland shows the same ids and figure sources.
- Keyboard reaches every Room 0 exhibit's dossier and can leave through the next hall. Reduced motion snaps.
- axe reports no serious or critical violations on `/`. Plate text uses ink on zinc.
- `npm test`, `npm run typecheck`, and the Playwright project pass.
- Room 1 does not start until this room is reviewed.
