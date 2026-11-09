# Design: reviewer feedback on the Timeline, Atlas and Globe

Date: 2026-11-09 · Status: approved by the owner

## Intent
A reviewer used the site and found three places where they lost their way:
- **Timeline.** It shows the First AI winter, so visitors expect a second one. The 1980–1993 gap reads as a gap in the museum rather than in history.
- **Atlas.** Unclear where to start: the axes, the colours and the controls are not explained on the page.
- **Globe.** Visually engaging, but the size of the differences between countries is hard to judge.

The fixes must keep the museum's core value: every fact on screen can be checked through a clickable source.

## Decisions (owner)
- **Sourcing.** New exhibits meet the same bar as every live one: `confirmed`, `officialPrimary`, and citations from at least two hostnames. A "winter" is a later label for a period, so it is shown through documented events and the room summary, never as an exhibit itself. The two withdrawn entries (`evt_1985_expert_spend`, `evt_1987_lisp_collapse`) stay withdrawn.
- **Timeline scope.** In scope: the expert systems boom, the second AI winter, and backpropagation (1986). Out of scope for this pass: the rise of statistical machine learning.
- **Artefacts.** None for the new exhibits in this pass.
- **Atlas help.** An always-visible line on how to move around, plus an HTML legend. Nothing to dismiss.
- **Globe chart.**
  - Each bar shows cumulative models for the selected year, on a linear scale, with its number printed beside it.
  - The ranking sits beside the globe, in the side column. Clicking a bar selects that country.
  - The table below re-sorts by rank and shows the same bars.

## 1. Timeline: 1980–1993
- **Research gate.** Candidates are checked against the bar, and the owner approves the shortlist before anything is seeded:
  - **Expert systems:** R1/XCON at DEC, Japan's Fifth Generation project, DARPA Strategic Computing, the UK Alvey programme.
  - **Backpropagation:** Rumelhart, Hinton & Williams, *Nature* 1986.
  - **Second winter:** documented events from 1987–93, such as the Fifth Generation project's final conference.
- **Seeding.** New exhibits go in `src/seed/eighties.ts`. Each one names its era explicitly; `eraForYear(1980)` returns the first winter, so the year alone is not enough.
- **Era summaries.** Era summaries are written only from the era's own exhibits. If no second-winter candidate passes, that era stays hidden and says nothing.
- **3D rooms.** The expert-systems and second-winter rooms get one exhibit spot per approved exhibit, each checked by a sightline test.
- **Production data.** It changes through `db:audit`, which the owner runs: `--dry-run` first, then the real run.

## 2. Atlas: say where to start
- **One plot column.** The plot, the view buttons, the how-to line and the legend share one column. The details panel keeps the other.
- **View buttons.** Front, Top, Side and "Back to the whole plot" move onto the plot's corner. They sit beside the 3D application element rather than inside it, so their keys never step between models. They appear only once the 3D view has loaded.
- **The legend explains:**
  - what each direction means;
  - the domain colours;
  - dimmed and muted dots;
  - the winter bands.
- **3D axis titles.** The 3D plot gains "Publication year" and "Domain" titles, set larger than the tick labels.
- **Camera.** The default camera does not change.

## 3. Globe: ranked bars
- **Counting.** Counts come from one function, `countAt`, used by the columns, the panel, the table and the ranking. A shared helper, `rankAt`, orders every country: most models first, then the earliest first model, then name.
- **Heading.** The ranking heading states what is compared. It uses the snapshot's threshold rather than a typed number.
- **Footnote.** A model from labs in two countries counts for both, and the footnote says so.
- **Layout.** The side column keeps room for both the ranking (which scrolls) and an open country panel. On mobile the ranking sits under the slider.
- **Bars.** Plain HTML and CSS bars. There is no chart library, and no new runtime dependency.

## Constraints and anti-goals
- **Constraints:**
  - No new runtime dependencies, no CDN assets, and the CSP stays unchanged.
  - New files stay under about 200 lines.
- **Anti-goals:**
  - Any exhibit that does not meet the bar.
  - Any number on screen without a source.
  - Help text that covers the plot.
  - Bars that disagree with the globe's columns.

## Verification
- **Checks:**
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
  - `npx playwright test --workers=1` for atlas, globe, era-rooms and csp, with no serious or critical axe violations
- **Screenshots** of `/`, `/atlas` and `/globe` at 1440×900 and 390×844.
