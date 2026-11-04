# Design

## Visual Theme

One look for the whole site: night and gold. A near-black ground, a slightly lifted dark panel, warm off-white text and a single gold accent. The home, the corridor (`/rooms/[era]`), the exhibit page, the Atlas, accuracy, changelog and the editor all use it.

The corridor is still drawn as a plan: halls, plinths and doorways are chalk linework drawn as hidden-line solids on a chalk grid, now on the night ground. The visitor reads a dark panel, laid out as a title block, pinned beside the plan. Gold is the draftsman's markup pencil and marks only where you are. Exhibit pages are the same panel on the same ground, with thin gold rules between sections.

## Color Palette

### Shared tokens (`--bp-*` in `app/globals.css`, mirrored in `src/museum/theme.ts`)

`theme.test.ts` fails if the CSS tokens or the glyphs drift from `theme.ts`. The token names keep their old cyanotype names ("prussian", "redline") so the 3D rooms repaint without edits; the values are night and gold.

| Token | Hex | Use |
| --- | --- | --- |
| Prussian (ground) | `#07070D` | Page, canvas, rail, solids that hide lines behind them |
| Lift (panel) | `#0C0D17` | Current hall chip, selected exhibit tab, pressed toggle, cards, the dossier and exhibit sheet |
| Chalk | `#E8E6F0` | Linework, body text (15.7:1 on the panel, 16.3:1 on the ground) |
| Chalk-dim | `#8B8AA3` | Grid, secondary lines, muted text, sealed halls, future-year exhibits (5.8:1 on the panel, 6.0:1 on the ground) |
| Redline (gold) | `#D4AF37` | The only "where you are" accent: year cursor, focused monument, current-hall underline, focus ring, links, section rules (9.2:1 on the panel) |
| Print | `#0C0D17` | The dossier and exhibit sheet panel; text on it is Ink |
| Ink | `#E8E6F0` | Text on the panel |
| Gold soft | `#F0D68A` | Headings on the night home (13.5:1 on the panel) |
| Cyan | `#5EEAD4` | Secondary accent: links on the night home (13.1:1 on the panel) |

Gold is never the only cue. Section rules on dark panels are gold at 45% (`--bp-rule`).

### Legacy names (accuracy, changelog, editor, badges)

These keep their names and now hold night values: `--floor` `#07070D` (body), `--plate` `#0C0D17` (panel), `--ink` `#E8E6F0` (text), `--brass` `#D4AF37` (links, years), `--pedestal` `#8B8AA3`.

Confidence is shown by word and shape, never by colour alone: filled circle (confirmed), half circle (reported), hollow circle (rumored), diamond (disputed), dash (unset). Badge colours are lightened to read on the dark panel; each is at least 7.4:1 on `#0C0D17`.

| Token | Hex | Use |
| --- | --- | --- |
| Established | `#5FBF9A` | Confirmed badge |
| Contested | `#E0A458` | Reported badge |
| Unknown | `#9CA8B8` | Rumored badge, muted notes |
| Retracted | `#EF8A7A` | Retracted marks |
| Flag | `#E8946A` | Disputed badge, curator note |
| Context | `#8FA3B3` | Context marks |

### Atlas (`/atlas`; tokens `--atlas-*` in `app/atlas/atlas.css`, mirrored in `src/atlas/theme.ts`)

The Atlas wears the shared night and gold palette. Most `--atlas-*` tokens are aliases of the `--bp-*` tokens above; grid and winter are its own. `src/atlas/theme.test.ts` fails if the CSS tokens drift from `theme.ts`.

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

- Display: Cormorant Garamond (`--font-display`, 600/700) for every h1 to h3 and for years.
- Interface: Space Grotesk (`--font-sheet`, 400/500/600) for the rail, tabs, titles in the title block, buttons and the nav, with tabular numerals for years.
- Story text: Literata (`--font-body`), max 65ch. Utility and badges on the older pages: IBM Plex Mono (`--font-mono`).
- The three.js labels use IBM Plex Mono (`public/fonts`). Syne and Barlow Semi Condensed are no longer used.

## Components

- **Rail**: the sheet's top border. Site name, then the year scale bar (ticks every decade, figures every half century, a Redline cursor), then the hall chips, then the Plan view toggle. Label is "Show work up to".
- **Hall chip**: a sheet tab. Chalk outline; the current hall is lifted with a Redline underline; a sealed hall has a dashed outline and cannot be opened.
- **Exhibit tabs**: the current hall's exhibits as a `tablist` under the plan. One tab stop, arrow keys, Home and End. This is the keyboard and screen-reader route to every monument. Future-year exhibits are dim chalk italic, never faded.
- **Plan view**: a toggle that frames the current hall from above. All exhibits stay selectable. Reduced motion snaps the camera.
- **Dossier (title block)**: a dark panel with ruled cells for hall, years, kind, confidence and "Sheet n of N", then the single `h1`, story, sources, and the link to the full exhibit. It is a `tabpanel` named by the selected exhibit tab, and a status line announces changes.
- **Badge**: word plus shape on a small plate. Unset says "unset".
- **Scene**: no lights. A solid is filled in the ground colour so it hides the lines behind it, outlined in Chalk (Chalk-dim for walls and the winter halls). The focused monument is outlined in Redline with a Redline cap. Figure plates keep their light image.
- **Exhibit page**: night ground, a "Back to {hall}" link, then one dark panel. It opens with the same title block (hall, years, kind, confidence), then the single `h1`, story, and sections ruled off in thin gold like blocks on a drawing: sources, connections, how the field changed. Revision history is a revision table: version and date in a narrow column, then the reason and the changes. The suggest form is a disclosure at the foot of the print.
- **Archive line**: one quiet Chalk-dim line on the ground when the bundled copy is showing.
- **Atlas**: one plot beside a panel. The plot is a lit 3D scene that shows the 80 most significant of Epoch AI's models by default, each as one dot (year left to right, training compute or parameters up, one row per domain). The 80 are chosen at build time by a tested rule (`src/atlas/select.ts`): every pinned model, every model that set a clear compute record, a minimum for each era, then the best scores from citations, Epoch's notability tags and its frontier and foundation flags, skipping any dot that would sit on another and any second row of one paper. The two AI winters are pale bands, and governance pins stand on a rail behind the plot. Exhibit-linked models are labelled in Gold soft and always shown; every other featured model is labelled only when the camera is close. A "Show all models" switch brings back the rest as small faint dots, and the page says how many models it is and is not drawing. The panel holds the controls (measure, which models, a "dim models after" year, back to the whole plot) and a live details block for the hovered or selected dot, which carries a "Why it is here" line for a featured model. Below the plot, two tables carry the 80 featured models (with the same reasons) and the governance entries as text, in the keyboard and screen-reader route, and the whole view when WebGL is missing. A credit line names Epoch AI and its licence.
- **Night home**: the public home is a dark hall (`#07070d`, gold `#d4af37`, cyan `#5eead4`). Same fonts as everywhere else.

## Layout

Wide screens: the sheet is exactly one viewport. Plan and exhibit tabs on the left, the title block on the right (`minmax(19rem, 28rem)`), scrolling inside its own column. Narrow: the title block first, then the plan; the rail is not sticky and the hall chips scroll in one row.

## Motion

Camera eases to the focused pedestal in about 1s; reduced motion snaps. The year rail is the only ornamental control: there are no drifting lights, pulsing threads or constant rotation in the corridor.

In the Atlas, motion is only ever an answer to the visitor. The one move the page makes on its own is the camera arriving on load (about 1.8s). After that: orbiting (damped), the camera easing to a chosen model (about 1.1s), and the dots gliding to their new height when the measure is switched (about 0.7s). Nothing drifts, pulses or rotates by itself. Reduced motion snaps every move and turns damping off.
