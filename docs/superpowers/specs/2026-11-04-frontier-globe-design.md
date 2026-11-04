# Design: the Frontier Globe, 2018–2026 exhibits, and a concise-copy pass

Date: 2026-11-04 · Status: draft for approval

## Intent
Visitors to the Hall of Eras should leave amazed at three things about AI since about 2018:
1. **The jump in size and compute.**
2. **How quickly each record fell.**
3. **How many countries and labs now build frontier-scale models.**

Every fact must be checkable through a clickable source. That is the museum's core value, so the site's existing honesty rules (confirmed-only exhibits, Epoch figures labelled as estimates) still bind.

## The three pieces, in build order
1. **Research and new exhibits for 2018 to 1 Nov 2026.** This comes first because the globe and the timeline both draw on it.
2. **The Frontier Globe page**, at `/globe`, in the top bar as Timeline · Atlas · Globe · About.
3. **A concise-copy pass** across the whole site.

---

## 1. Research and new exhibits
- **Candidates:** architecture shifts and major model releases from labs worldwide, including open-weight ones.
  - Examples to verify, not a final list: BERT (2018), GPT-2 (2019), the scaling-laws paper (2020), GPT-3 (2020), Wu Dao 2.0 (2021), Chinchilla (2022), Llama (2023), Mistral 7B (2023), Falcon (2023), Qwen (2023), o1 (2024), DeepSeek-V3 (2024), DeepSeek-R1 (2025), and the largest training run as of 1 Nov 2026 (Epoch lists GPT-6 Astra, 2026-09-03).
  - The research favours the moments that show scale, the pace of records, and global spread. It picks the most suitable set, not every model.
- **Bar for each exhibit:** the existing confirmed rule (`src/domain/confidence.ts`):
  - `officialPrimary` is set, meaning one citation is the primary record: the paper, model card, or the lab's official announcement.
  - Citations come from at least two independent domains, for example the arXiv paper plus the lab's own page.
  - Every URL must be verified to resolve. No invented URLs.
- **Story text:** short and factual, saying only what the sources say.
- **Count:** 10–14 exhibits (owner's choice). The Frontier era is expected to stay one era.
- **Artefacts:** add 2–3 code-built 3D replicas for the biggest moments (owner's choice), for example an accelerator chip or a datacentre rack. Each follows the existing artefact pattern:
  - an entry in the registry (`src/museum/artefacts.ts`) and a component built with Ink line-art;
  - the "Replica" label with an openly licensed, verified reference photo, plus sourced hotspots;
  - the bounded motion rules.
  Which moments get artefacts is chosen in the research table.
- **Placement:** exhibits go into the existing eras (Deep learning, Transformer era, Generative boom, Frontier) and follow the existing seed pattern (`src/seed/eras.ts`, validator, snapshot).
- **Gate:** the research produces a proposal table, mirroring `docs/accuracy-audit-2026-11.md`. The owner approves it before anything is added.
- **Era balance:** if the Frontier era becomes crowded (more than about 10 exhibits), split it. The split is proposed in the same table.
- **Live DB:** new exhibits reach production through the existing paths. That means `db:seed` for an empty DB, and an extension of `db:audit` (`src/server/audit.ts`), which applies seed exhibits through `commitWrite` and stays idempotent.

## 2. The Frontier Globe page
**Data**
- **Source:** Epoch AI's `large_scale_ai_models.csv` (models trained with ≥10²³ FLOP), from the same zip the Atlas already ingests (`scripts/atlas-snapshot.ts`, `https://epoch.ai/data/ai_models.zip`).
  - Reuse that pipeline and its licence guard (`src/atlas/licenceGuard.ts`). Add the `Country (of organization)` field and a large-scale flag to the snapshot, or a sibling `data/globe-snapshot.json` built in the same script.
  - No new data source, and no new runtime dependency.
- **Counts:** these come from Epoch. As of the 2026-11-03 file, the cumulative totals are:

  | Year | Labs | Countries |
  |---|---|---|
  | 2019 | 1 | 1 |
  | 2021 | 14 | 5 |
  | 2023 | 95 | 15 |
  | 2025 | 151 | 21 |
  | 2026 | 157 | 21 |

  The build computes these; they are never typed by hand.
- **Records:** "largest training compute to date", computed from Epoch's all-models file. The record went from about 1.6×10¹⁶ FLOP (2012) to GPT-3 at 3.1×10²³ (2020), GPT-4 at 2.1×10²⁵ (2023), and 9.4×10²⁶ (2026-09-03).
- **Labelling:** every figure is labelled "Epoch AI estimate", with a link to Epoch's page for that model. This is the same exemption the Atlas has.
- **Cutoff:** 1 Nov 2026. Rows dated later are excluded.

**Pins**
- Pins are by **country**, because Epoch gives a country, not a city. A lab's city is not invented.
- Each country gets one pin at a fixed reference point (its centroid, from the Natural Earth data or a small committed table).
- Epoch's "Multinational" labs appear in a list beside the globe, not as a pin.
- Each pin has a gold column whose height scales with that country's cumulative large-scale models.
- Click or Enter on a pin opens a side panel (a bottom sheet on mobile). It shows the country, its labs, and its models by year, each with the Epoch estimate, a source link, and a link to its Atlas dot.

**Earth**
- Real satellite imagery: NASA Blue Marble, public domain.
- It is self-hosted under `public/`, toned darker so the gold reads, and kept to about 2 MB or less (for example a 2048×1024 JPEG/WebP).
- It is credited on the page ("Imagery: NASA Blue Marble, public domain").
- It loads only on `/globe`.

**Interaction**
- Full freedom: orbit on any axis, tilt, zoom from the whole planet down to a country, and pan within limits. This reuses the Atlas camera ideas: `components/atlas/CameraRig.tsx` with clamped distance, damping, and damping off under reduced motion.
- A year slider from 2018 to Nov 2026. It is a native range input, the keyboard route, stepping by year. It replays the spread: columns grow and countries light up as their first large-scale model arrives.
- A live line, e.g. "2026: 157 labs in 21 countries · largest run ×10¹⁰ since 2012".
- A records strip: each time the slider passes a new compute record, that model is named with its multiplier over the previous record.

**Motion**
- No idle animation.
- Columns ease only in answer to the slider or a click, using the existing bounded play window (`components/artefacts/playWindow.ts` / `motion.ts`).
- Under reduced motion, everything snaps.

**Rendering**
- One canvas, loaded via `next/dynamic` `ssr:false`, as `AtlasShell` does.
- `frameloop="demand"`.
- Pins and columns are instanced.

**Fallback**
- Without WebGL, show a table of countries × labs × models with the same slider and links.
- This is also the screen-reader route, and it is the same pattern as the Atlas tables.

**Look**
- The night + gold tokens (`--bp-*`), Cormorant headings, and Space Grotesk interface type.
- The globe is the page's one bold element. Everything else is quiet.

## 3. Concise-copy pass
- **Scope:** every page, covering hero lines, page intros, labels, buttons, empty and error states, the About/Accuracy text, Atlas explanations, and the dossier and exhibit chrome.
- **Goal:** the shortest wording that still explains itself. Plain verbs, sentence case, no filler.
- **Facts stay:** exhibit stories, claims and confidence are not reworded for brevity. A wording change to an exhibit's factual text goes through the same source check as the audit.
- **Review:** the pass produces a before → after list for the owner to skim.

## Constraints and non-goals
- **Constraints:**
  - Keep the confirmed-only rule.
  - Keep the Atlas and the globe as "Epoch AI estimate" data.
  - No new runtime dependencies.
  - No glTF.
  - No CDN assets, so the CSP (`next.config.ts`) is unchanged.
  - Self-hosted imagery only.
- **Anti-goals:**
  - Any unsourced number on screen.
  - Pins at invented cities.
  - Idle spinning or pulsing.
  - Breaking the no-WebGL route.
  - A copy pass that changes facts.
- **Non-goal:** a per-lab city map, which would need separately sourced HQ locations.

## Verification
- **Checks:** `npm run build` (required), `npm run typecheck`, `npx vitest run`, and `npx playwright test --workers=1`, using the SwiftShader flags for WebGL specs.
- **Unit tests:**
  - Globe counts and records are computed from the snapshot.
  - The cutoff is honoured.
  - Every new exhibit passes the confirmed rule.
- **e2e:**
  - `/globe` renders, the slider changes the count line, and a pin or panel link opens its Atlas dot.
  - The no-WebGL table works.
  - CSP spec on `/globe`.
- **Screenshots** at 1440×900 and 390×844.
- **Production:** merge to `main`, which deploys production, then verify the live `/globe`.

## Delivery (decided; marked "my call" where the owner did not choose)
- **Branch and release:** work on a new branch from `main` and open a PR into `main`. Vercel's production branch is `main`, so merging deploys. `feature/ai-gallery` has been fully merged into `main`.
- **Live data:** the owner runs any production data change themselves, using `db:audit -- --dry-run` first, then `db:audit`. The builder never writes to the production DB. (my call, following the existing pattern)
- **Order:** the approval gate blocks only adding the exhibits. The globe can be built while the table is being reviewed. The copy pass runs last, so the new exhibits aren't reworded twice. (my call)
- **Data check:** Epoch's zip includes `large_scale_ai_models.csv`. This was checked in the 2026-11-03 download.
- **Before 2018:** the records strip starts from the 2012 record as its baseline. At 2018 the globe shows no columns, with a one-line note that the first ≥10²³ FLOP model arrives in 2019. (my call)

## Left to the builder
- Exact pin geometry and column scale curve.
- Panel layout details.
- Texture resolution, within the size cap.
- How the records strip animates within the motion rules.
- The file split. Keep each file under 200 lines.
