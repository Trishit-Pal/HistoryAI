# Copy pass, November 2026

Interface copy only. Line numbers are those before the pass.

Out of scope and untouched: exhibit stories, claims, editorial notes, era summaries, artefact credits and hotspots, changelog reasons, the "Epoch AI estimate" label, and the cutoff wording "by 1 Nov 2026". The meaning of the confirmed rule on /accuracy is unchanged; only its wording is shorter.

Repeats removed (one explanation kept):
- Atlas: how many models the plot shows is said once, in the coverage line beside the controls. It is cut from the intro and the table caption.
- Accuracy: the confirmed rule is defined once, in the list. The paragraph above it no longer restates it.
- Atlas panel: "Epoch AI estimate" stays; the sentence repeating it is cut.

Left as is: strings that tests or flows already name consistently (for example "Search exhibits", "Enter the hall", "Visit …", "Previous era / Next era", "Back to the whole plot", "Choose a year"), `app/changelog/page.tsx` (nothing to shorten), and the globe's cutoff and count lines.

## Shared banner and terms

| File:line | Before | After |
|---|---|---|
| components/home/Timeline.tsx:57, components/MuseumShell.tsx:114, components/ExhibitPage.tsx:29 | Showing the archived copy from {date}. | Archived copy from {date}. |
| components/ExhibitPage.tsx:38 | See it in the atlas | See it in the Atlas (the page and nav call it Atlas) |

## Home

| File:line | Before | After |
|---|---|---|
| components/home/Timeline.tsx:61 | A sourced walk through the history of artificial intelligence, one era at a time. | A sourced history of artificial intelligence, one era at a time. |
| components/home/ArtefactDial.tsx:56 | {kind} of the artefact for {title} ({year}), standing at the front of a ring of era artefacts. | {kind}: {title} ({year}), at the front of a ring of era artefacts. |

## Hall and exhibit chrome

| File:line | Before | After |
|---|---|---|
| components/MuseumShell.tsx:135 | Showing {title}, {confidence}, in {hall}. | {title}, {confidence}, in {hall}. |
| components/Dossier.tsx:35, components/Flatland.tsx:16 | Nothing provisional is on the floor yet. | No provisional exhibits yet. |
| components/ExhibitPage.tsx:80 | No source is stored yet. | No sources yet. |

## Atlas

| File:line | Before | After |
|---|---|---|
| components/atlas/AtlasShell.tsx:167-171 | Each dot is an AI model. Left to right is the year it was published. Height is the training compute, or the parameter count, that Epoch AI estimates for it. Each row of dots is one domain, such as language or vision. The plot shows the {n} most significant models, and one switch brings back the rest. | Each dot is an AI model. Left to right is its publication year, height is the training compute or parameter count Epoch AI estimates, and each row is a domain, such as language or vision. |
| components/atlas/AtlasShell.tsx:27 | Three-dimensional plot of AI models. Left to right is the year, height is training compute or parameters, and depth separates domains. A table of the most significant models follows the plot. | 3D plot of AI models: year left to right, training compute or parameters as height, domain as depth. A table of the most significant models follows. |
| components/atlas/AtlasShell.tsx:176 | With the plot focused, use the left and right arrow keys, or the square bracket keys, to step between models. | Focus the plot, then use the arrow keys or [ and ] to step between models. |
| components/atlas/AtlasShell.tsx:206 | This browser cannot draw the 3D view, so the same landmark models are listed in the table below. | This browser cannot draw the 3D view. The landmark models are in the table below. |
| components/atlas/AtlasTable.tsx:40 | The {n} most significant models, oldest first. In the plot, 'Show all models' draws every model Epoch AI lists. | The {n} most significant models, oldest first. |
| components/atlas/AtlasPanel.tsx:170-172 | Epoch AI estimate. The figures are published by Epoch AI. | Epoch AI estimate. |
| components/atlas/AtlasPanel.tsx:181 | Hover over a dot to read about the model. Select one to fly to it. | Hover a dot for details. Select it to fly there. |
| app/atlas/page.tsx:11-12 | Every AI model in Epoch AI's data, placed by year and by the training compute or parameters it needed, with the landmark models linked to their exhibits. | Every AI model in Epoch AI's data by year and by training compute or parameters, with landmark models linked to their exhibits. |

## Globe

| File:line | Before | After |
|---|---|---|
| components/globe/GlobeShell.tsx:23 | Globe of the Earth with one gold column per country; the taller the column, the more models trained on at least 10^23 FLOP. The table below lists the same countries. | Globe with a gold column per country; taller means more models trained on at least 10^23 FLOP. The table below lists the same countries. |
| components/globe/GlobeShell.tsx:105 | …by the country of the lab that built it. Move the year to watch… | …by the country of its lab. Move the year to watch… |
| components/globe/GlobeShell.tsx:157 | None by {year}. | None {by-year phrase}, the same wording as the table (for example "None by the end of 2023"; 2026 stays "by 1 Nov 2026"). |
| components/globe/GlobeShell.tsx:170 | …up to 1 November 2026. | …up to 1 Nov 2026. (matches the rest of the page) |

## Accuracy (app/accuracy/page.tsx)

| Line | Before | After |
|---|---|---|
| 7-12 | Every exhibit on the floor is confirmed. Confirmed means two things. One of its sources is the primary record itself: the paper, the report, the law, or the official page of the organisation involved. And its sources come from at least two different websites. An exhibit that cannot meet that bar is not shown. | Every exhibit on the floor is confirmed. An exhibit that is not confirmed is not shown. |
| 16 | A primary record, and sources from at least two different websites. | One source is the primary record itself: the paper, the report, the law, or the official page of the organisation involved. And its sources come from at least two different websites. |
| 21-26 | In November 2026 every exhibit was checked against this rule. Exhibits that met it stayed, some with corrected wording or an added primary source. Eight did not meet it and were withdrawn. A withdrawn exhibit leaves the halls, but it is not erased: the changelog keeps a line for it that says "Withdrawn", the date, and the reason. Two eras, the expert systems boom and the second AI winter, have no confirmed exhibit yet, so they have no hall for now. | In November 2026 every exhibit was checked against this rule. Those that met it stayed, some with corrected wording or an added primary source. Eight did not and were withdrawn. A withdrawn exhibit leaves the halls but stays in the changelog, with "Withdrawn", the date and the reason. Two eras, the expert systems boom and the second AI winter, have no confirmed exhibit yet, so they have no hall. |
| 32-33 | …open debates. Context copy is not the technical lineage. A curator's note… | …open debates, and is not the technical lineage. A curator's note… (the second layer is the subject of the sentence) |
| 37-41 | …Harm, legal rulings, and named-person ethics wait for a person even when sources agree. A confirmed routine release may be stored as a provisional card. Nothing in the curator may write the technical canon. Every change appends a version. The previous blob stays. | …Harm, legal rulings, and named-person ethics wait for a person even when sources agree. A confirmed routine release may be stored as a provisional card. The curator cannot write the technical canon. Every change adds a version, and the previous one stays. |
| 45-48 | Each is copied at a known date and shown with its licence. Figures are estimates published by their source, so they are labelled as that source's estimates, not as confirmed exhibits. | Each is copied on a known date and shown with its licence. Figures are the source's own estimates and are labelled that way, not as confirmed exhibits. |
| 65 | Changelog — every change to the exhibits (link under the "Changelog" heading) | Every change to the exhibits |
| 69-72 | Nothing is published from that form. An editor reviews the queue. The site stores a hash of the network address used to send the suggestion, not the address itself, and it does not ask for a name or an email. | Nothing is published from it. An editor reviews the queue. The site stores a hash of the sender's network address, not the address itself, and asks for no name or email. |

## Tests updated for changed strings

- components/home/timeline.dom.test.tsx:41 and e2e/exhibit.spec.ts:12: "Showing the archived copy from" becomes "Archived copy from".
- components/exhibit.dom.test.tsx:45,48 and e2e/atlas.spec.ts:42: link name "See it in the Atlas".
- e2e/atlas.spec.ts:72,76,82: model count "1,406" becomes "1,407". Not a copy change: the Atlas snapshot refreshed in an earlier task and the spec was stale.
