export type AtlasSourceId =
  | "epoch-ai-models"
  | "aiid"
  | "eur-lex"
  | "stanford-ai-index"
  | "wikimedia-commons";

export interface AtlasSource {
  readonly id: AtlasSourceId;
  readonly name: string;
  readonly homepage: string;
  /** SPDX-style id, or a plain-words rule when the licence is set per item. */
  readonly licence: string;
  readonly licenceUrl: string;
  /** Shown on /accuracy and in the atlas panel. Must credit the source the way it asks. */
  readonly attribution: string;
  /** Date the licence was last read at its source (ISO, YYYY-MM-DD). */
  readonly retrieved: string;
  /** True when reuse is unclear or forbidden: cite and link, never redraw or re-plot. */
  readonly linkOnly: boolean;
  /** Why the entry is what it is, for the next person who reads this. */
  readonly note: string;
}

export const ATLAS_SOURCES: readonly AtlasSource[] = [
  {
    id: "epoch-ai-models",
    name: "Epoch AI, Data on AI models",
    homepage: "https://epoch.ai/data/ai-models",
    licence: "CC-BY-4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    attribution:
      "Epoch AI, ‘Data on AI models’. Published online at epoch.ai. Retrieved from ‘https://epoch.ai/data/ai-models’ [online resource].",
    retrieved: "2026-11-03",
    linkOnly: false,
    note: "Licence and citation string are quoted from the README inside ai_models.zip.",
  },
  {
    id: "eur-lex",
    name: "EUR-Lex, Publications Office of the European Union",
    homepage: "https://eur-lex.europa.eu/",
    licence: "Reuse authorised under Commission Decision 2011/833/EU",
    licenceUrl: "https://eur-lex.europa.eu/eli/dec/2011/833/oj/eng",
    attribution: "© European Union, https://eur-lex.europa.eu/",
    retrieved: "2026-11-03",
    linkOnly: false,
    note: "The atlas only states a title, a date and a link for each legal act. It never copies the act's text.",
  },
  {
    id: "wikimedia-commons",
    name: "Wikimedia Commons",
    homepage: "https://commons.wikimedia.org/",
    licence: "Set per file. Only PD-old, PD-US-expired, CC0-1.0, CC-BY-4.0 and CC-BY-SA-4.0 are accepted.",
    licenceUrl: "https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia",
    attribution: "Credit line and licence are shown on each plate.",
    retrieved: "2026-11-03",
    linkOnly: false,
    note: "Every plate carries its own licence, checked on the file page. A file with no clear licence is not used.",
  },
  {
    id: "aiid",
    name: "AI Incident Database",
    homepage: "https://incidentdatabase.ai/",
    licence: "CC-BY-SA-4.0 for some collections, with exclusions and a no-commercial-exploitation clause",
    licenceUrl: "https://incidentdatabase.ai/terms-of-use/",
    attribution: "Responsible AI Collaborative, AI Incident Database.",
    retrieved: "2026-11-03",
    linkOnly: true,
    note: "The Terms of Use license the incident collections under CC BY-SA 4.0 but exclude report text and media, and the Conditions of Use bar commercial exploitation without permission. Those two do not obviously agree, so incidents are cited as links until the Collaborative clarifies.",
  },
  {
    id: "stanford-ai-index",
    name: "Stanford HAI, AI Index Report",
    homepage: "https://hai.stanford.edu/ai-index",
    licence: "Not confirmed on an official page (secondary sites report CC BY-ND 4.0, which forbids derivatives)",
    licenceUrl: "https://hai.stanford.edu/ai-index",
    attribution: "The AI Index Report, AI Index Steering Committee, Stanford Institute for Human-Centered AI.",
    retrieved: "2026-11-03",
    linkOnly: true,
    note: "Charts and figures are never redrawn or re-plotted. Link to the report instead.",
  },
];

export function getSource(id: AtlasSourceId): AtlasSource {
  const source = ATLAS_SOURCES.find((candidate) => candidate.id === id);
  if (!source) throw new Error(`Unknown atlas source: ${id}`);
  return source;
}

export function reusableSources(): readonly AtlasSource[] {
  return ATLAS_SOURCES.filter((source) => !source.linkOnly);
}
