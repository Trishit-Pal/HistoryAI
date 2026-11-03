# Design

## Visual Theme

The corridor (`/rooms/[era]`) is a set of cyanotype drawings. The ground is Prussian blue; halls, plinths and doorways are chalk linework drawn as hidden-line solids on a chalk grid. The visitor reads a pale print, laid out as a title block, pinned beside the plan. Redline is the draftsman's markup pencil and marks only where you are.

The exhibit page (`/rooms/[era]/[exhibit]`) is one more sheet in the same language. Accuracy, changelog and the editor keep the earlier stone and zinc theme (below); they are not redrawn as sheets.

## Color Palette

### Sheet (the corridor `.shell` and the exhibit page `.exhibit-page`; tokens `--bp-*`, mirrored in `src/museum/theme.ts`)

| Token | Hex | Use |
| --- | --- | --- |
| Prussian | `#0E2A47` | Ground: page, canvas, rail, solids that hide lines behind them |
| Prussian-lift | `#16406A` | Current hall chip, selected exhibit tab, pressed toggle |
| Chalk | `#EAF1F5` | Linework, text on blue |
| Chalk-dim | `#8FAEC6` | Grid, secondary lines, sealed halls, future-year exhibits (6.3:1 on Prussian) |
| Redline | `#FF7A59` | The only accent: year cursor, focused monument, current-hall underline, focus ring on blue (5.7:1 on Prussian) |
| Print | `#F2F6F8` | The Dossier sheet; text and links on it are Ink `#1E2430` |

Redline sits on dark blue, never on near-black, and is never the only cue. Confidence badges keep their stone-theme colours on the print and add a shape: filled circle (confirmed), half circle (reported), hollow circle (rumored), diamond (disputed), dash (unset). `theme.test.ts` fails if the CSS tokens or glyphs drift from `theme.ts`.

### Stone and zinc (accuracy, changelog, editor)

| Token | Hex | Use |
| --- | --- | --- |
| Floor | `#1A1814` | Body |
| Pedestal | `#C8BBA4` | Pedestals |
| Brass | `#A6843D` | Links and headings on the floor |
| Ink | `#1E2430` | Text and links on the plate |
| Plate | `#E4E7EA` | Reading panel, accuracy, changelog |
| Established | `#3D6B58` | Confirmed badge on a plate chip |
| Contested | `#A56B2A` | Reported badge |
| Unknown | `#5E6A78` | Rumored badge |
| Flag | `#8C4A2F` | Disputed badge, curator note |

### Atlas (`/atlas`; tokens `--atlas-*` in `app/atlas/atlas.css`, mirrored in `src/atlas/theme.ts`)

The Atlas is a third theme: the night-home family, lit. `src/atlas/theme.test.ts` fails if the CSS tokens drift from `theme.ts`.

| Token | Hex | Use |
| --- | --- | --- |
| Ground | `#07070d` | Page, scene background and fog |
| Grid | `#26264a` | Floor and wall lines of the plot |
| Gold | `#d4af37` | Pressed controls, rules |
| Gold soft | `#f0d68a` | Titles, exhibit-linked landmark labels, the confidence line |
| Cyan | `#5eead4` | Links, governance pins and labels |
| Text | `#e8e6f0` | Body and milestone labels |
| Muted | `#8b8aa3` | Tick labels, secondary copy |
| Winter | `#7dd3fc` | The two AI-winter bands |

Nine lane colours (in `theme.ts`) tell the domains apart, and each lane is also its own row in space with a written name, so colour is never the only cue. A figure always carries the `◐ Reported` mark and word: Epoch AI publishes estimates, so nothing here is "confirmed".

## Typography

- Sheet (corridor and exhibit page): Barlow Semi Condensed (`--font-sheet`, 400/500/600), a DIN-style drafting letterform in sentence case with tabular numerals for years. Story text stays Literata, max 65ch. The three.js labels use IBM Plex Mono (`public/fonts`).
- Other pages: Syne for display (`--font-display`), Literata for body, IBM Plex Mono for utility.
- Night home and Atlas: Cormorant Garamond for titles, Space Grotesk for the rest. The Atlas's 3D labels use IBM Plex Mono (`public/fonts`), as the corridor's do.

## Components

- **Rail**: the sheet's top border. Site name, then the year scale bar (ticks every decade, figures every half century, a Redline cursor), then the hall chips, then the Plan view toggle. Label is "Show work up to".
- **Hall chip**: a sheet tab. Chalk outline; the current hall is lifted with a Redline underline; a sealed hall has a dashed outline and cannot be opened.
- **Exhibit tabs**: the current hall's exhibits as a `tablist` under the plan. One tab stop, arrow keys, Home and End. This is the keyboard and screen-reader route to every monument. Future-year exhibits are dim chalk italic, never faded.
- **Plan view**: a toggle that frames the current hall from above. All exhibits stay selectable. Reduced motion snaps the camera.
- **Dossier (title block)**: a pale print with ruled cells for hall, years, kind, confidence and "Sheet n of N", then the single `h1`, story, sources, and the link to the full exhibit. It is a `tabpanel` named by the selected exhibit tab, and a status line announces changes.
- **Badge**: word plus shape on a small plate. Unset says "unset".
- **Scene**: no lights. A solid is filled in the ground colour so it hides the lines behind it, outlined in Chalk (Chalk-dim for walls and the winter halls). The focused monument is outlined in Redline with a Redline cap. Figure plates are pale prints.
- **Exhibit page**: Prussian ground, a "Back to {hall}" link, then one pale print. It opens with the same title block (hall, years, kind, confidence), then the single `h1`, story, and sections ruled off like blocks on a drawing: sources, connections, how the field changed. Revision history is a revision table: version and date in a narrow column, then the reason and the changes. The suggest form is a disclosure at the foot of the print.
- **Archive line**: one quiet Chalk-dim line on the ground when the bundled copy is showing.
- **Atlas**: one plot beside a panel. The plot is a lit 3D scene that shows the 80 most significant of Epoch AI's models by default, each as one dot (year left to right, training compute or parameters up, one row per domain). The 80 are chosen at build time by a tested rule (`src/atlas/select.ts`): every pinned model, every model that set a clear compute record, a minimum for each era, then the best scores from citations, Epoch's notability tags and its frontier and foundation flags, skipping any dot that would sit on another and any second row of one paper. The two AI winters are pale bands, and governance pins stand on a rail behind the plot. Exhibit-linked models are labelled in Gold soft and always shown; every other featured model is labelled only when the camera is close. A "Show all models" switch brings back the rest as small faint dots, and the page says how many models it is and is not drawing. The panel holds the controls (measure, which models, a "dim models after" year, back to the whole plot) and a live details block for the hovered or selected dot, which carries a "Why it is here" line for a featured model. Below the plot, two tables carry the 80 featured models (with the same reasons) and the governance entries as text, in the keyboard and screen-reader route, and the whole view when WebGL is missing. A credit line names Epoch AI and its licence.
- **Night home**: the public home is a dark hall (`#07070d`, gold `#d4af37`, cyan `#5eead4`). Cormorant Garamond for titles, Space Grotesk for the rest of that page.

## Layout

Wide screens: the sheet is exactly one viewport. Plan and exhibit tabs on the left, the title block on the right (`minmax(19rem, 28rem)`), scrolling inside its own column. Narrow: the title block first, then the plan; the rail is not sticky and the hall chips scroll in one row.

## Motion

Camera eases to the focused pedestal in about 1s; reduced motion snaps. The year rail is the only ornamental control: there are no drifting lights, pulsing threads or constant rotation in the corridor.

In the Atlas, motion is only ever an answer to the visitor. The one move the page makes on its own is the camera arriving on load (about 1.8s). After that: orbiting (damped), the camera easing to a chosen model (about 1.1s), and the dots gliding to their new height when the measure is switched (about 0.7s). Nothing drifts, pulses or rotates by itself. Reduced motion snaps every move and turns damping off.
