import type { Citation, FieldChange } from "../domain/types";
import type { SeedNode } from "./eras";

// Withdrawn by the November 2026 accuracy audit (docs/accuracy-audit-2026-11.md).
// Kept as first published, so the seed changelog can show each withdrawal honestly.
// They are written, then set to "withdrawn"; no public page shows them.

export type WithdrawnNode = SeedNode & { withdrawnReason: string };

function c(url: string, publisher: string): Citation {
  return { url, publisher, retrieved: "2026-10-04" };
}

function changed(before: string, after: string, ...citationUrls: string[]): FieldChange {
  return { before, after, citationUrls };
}

const nilsson: Citation = { url: "https://ai.stanford.edu/~nilsson/QAI/qai.pdf", publisher: "Nils J. Nilsson", retrieved: "2026-10-02" };

export const WITHDRAWN_NODES: WithdrawnNode[] = [
  {
    id: "evt_history_overview",
    withdrawnReason: "A framing plaque about how one secondary history frames the field, not a documented event. It had a single source.",
    title: "Mechanical and logical precursors",
    startYear: 1854,
    eraId: "era_0_precursors",
    kind: "idea",
    layer: "context",
    publicStory:
      "Nilsson's history treats Aristotle's syllogism as important for its form, Boole's 1854 Laws of Thought as showing that some logical reasoning can be done by manipulating equations, and Babbage's engines as engineering clues in that quest.",
    citations: [nilsson],
    confidence: "reported",
    tags: ["precursor"],
    fieldChange: {
      before: "A history of the field could open at the first meeting that used the name, and leave earlier logic and machinery outside it.",
      after:
        "Nilsson's survey places the form of the syllogism, Boole's 1854 equations, and Babbage's engines inside that history, as clues rather than as one technical result.",
      citationUrls: [nilsson.url],
    },
    editorialNote:
      "Framing plaque. Nilsson's pages say the print version is Cambridge University Press and ask readers not to cite this PDF. The URL is the file that was opened. Not a single technical result.",
    figure: {
      src: "/museum/era-0/overview.svg",
      alt: "A stepped line marked 1843, 1854, 1936, 1938, 1943, and 1948.",
      credit: "Original illustration of the years in this room. Not a plate from Nilsson.",
      license: "original",
      sourceUrl: nilsson.url,
      kind: "redrawn",
      sourceLabel: "Nils J. Nilsson",
      redrawnAfter: nilsson.url,
    },
  },
  {
    id: "evt_1974_first_winter",
    withdrawnReason: "A later label for a period, not a documented event. Both sources were secondary histories.",
    title: "First AI winter",
    startYear: 1974,
    eraId: "era_3_first_winter",
    kind: "period",
    publicStory:
      "Retrospectives treat 1974–1980 as the first AI winter, when inflated promises met computational and theoretical limits of symbolic AI.",
    citations: [
      c("https://ai.stanford.edu/~nilsson/QAI/qai.pdf", "Nils J. Nilsson"),
      c("https://en.wikipedia.org/wiki/AI_winter", "Wikipedia"),
    ],
    fieldChange: changed(
      "The funding cuts after 1973 were separate decisions, not yet one named period.",
      "Nilsson's survey is one later history that places those years in a longer story. The name AI winter is the label on the Wikipedia page for 1974–1980, not a name from 1974 itself.",
      "https://ai.stanford.edu/~nilsson/QAI/qai.pdf",
      "https://en.wikipedia.org/wiki/AI_winter",
    ),
    confidence: "reported",
    tags: ["winter"],
    endYear: 1980,
  },
  {
    id: "evt_1985_expert_spend",
    withdrawnReason: "Both sources were on one website (OSTI), and the only other website found was a DOI for the same report, so there were not two independent sources.",
    title: "Expert systems commercial boom",
    startYear: 1985,
    eraId: "era_4_expert_systems",
    kind: "institution",
    publicStory:
      "A 1985 government report estimated AI-related activity funded by government and industry at about $400 million that year. A separate 1985 note put sales of AI software and hardware at about $150 million a year.",
    citations: [
      c("https://www.osti.gov/servlets/purl/5692492", "OSTI"),
      c("https://www.osti.gov/biblio/5249661", "OSTI"),
    ],
    confidence: "reported",
    tags: ["capability_breakthrough"],
    editorialNote:
      "The billion-dollar sentence was not on an institutional page opened for this edit. The $400 million estimate is the 1985 Argonne report. The $150 million sales figure is a 1985 journal note.",
    fieldChange: changed(
      "Expert systems were laboratory programs, without a published government estimate of that year's spending.",
      "The Argonne report opened on OSTI estimates AI-related activity, government and industry, at about $400 million in 1985.",
      "https://www.osti.gov/servlets/purl/5692492",
    ),
  },
  {
    id: "evt_1987_lisp_collapse",
    withdrawnReason: "No primary record was found. The sources were a student course paper and Wikipedia.",
    title: "LISP-machine market collapse",
    startYear: 1987,
    eraId: "era_5_second_winter",
    kind: "failure",
    publicStory:
      "General-purpose workstations matched specialized LISP-machine performance at lower cost. The LISP-hardware market collapsed, taking much of the expert-systems industry with it.",
    citations: [
      c(
        "https://ocw.mit.edu/courses/6-933j-the-structure-of-engineering-revolutions-fall-2001/30eb0d06f5903c7a4256d397a92f6628_Symbolics.pdf",
        "MIT OpenCourseWare",
      ),
      c("https://en.wikipedia.org/wiki/AI_winter", "Wikipedia"),
    ],
    fieldChange: changed(
      "Specialized Lisp machines were the machines on which U.S. expert-systems work was expected to run.",
      "A Symbolics history in an MIT course records a 1987 crisis: product revenue fell from $101.6 million in 1986 to $82.1 million in 1987 and $55.6 million in 1988, as general workstations became usable for Lisp.",
      "https://ocw.mit.edu/courses/6-933j-the-structure-of-engineering-revolutions-fall-2001/30eb0d06f5903c7a4256d397a92f6628_Symbolics.pdf",
    ),
    confidence: "reported",
    tags: ["winter", "documented_failure"],
  },
  {
    id: "evt_2015_google_photos",
    withdrawnReason: "No official Google record was found. The sources were a list article and a news report.",
    title: "Google Photos gorilla mislabel",
    startYear: 2015,
    eraId: "era_7_deep_learning",
    kind: "failure",
    publicStory:
      "Google Photos labeled Black users as gorillas. Reporting describes a later fix that removed the word gorilla from the label set rather than retraining the model.",
    citations: [
      c("https://incidentdatabase.ai/reports/648", "AI Incident Database"),
      c("https://gigazine.net/gsc_news/en/20230523-google-photo-ai-prevent-labeled-gorillas", "Gigazine"),
    ],
    fieldChange: changed(
      "A wrong photo label was treated as a mistake a retrained model would simply stop making.",
      "The incident report records the gorilla label. Gigazine describes a later fix that removed the word from the label set rather than retraining the model.",
      "https://incidentdatabase.ai/reports/648",
      "https://gigazine.net/gsc_news/en/20230523-google-photo-ai-prevent-labeled-gorillas",
    ),
    confidence: "reported",
    tags: ["documented_bias_failure"],
  },
  {
    id: "evt_2017_transformer_citations",
    withdrawnReason: "The plaque stated no claim and had a single source.",
    title: "Transformer citation-count claim",
    startYear: 2017,
    eraId: "era_8_transformers",
    kind: "idea",
    publicStory:
      "On 4 October 2026 the secondary page previously cited for a most-cited ranking did not answer, and no citation index was opened. This plaque does not state a rank.",
    citations: [c("https://arxiv.org/abs/1706.03762", "arXiv")],
    confidence: "reported",
    tags: ["open_debate"],
    editorialNote:
      "The Jerry Cards page returned 403 and was removed. No citation index was opened. The rank is not stated. Not canon.",
    fieldChange: changed(
      "A ranking of the Transformer paper among the most-cited papers of the century was carried from a single secondary page.",
      "That page did not answer. The arXiv record is the paper itself, not a citation count, so the museum states no rank.",
      "https://arxiv.org/abs/1706.03762",
    ),
    publicationState: "provisional",
    incomplete: true,
  },
  {
    id: "evt_2025_winter_debate",
    withdrawnReason: "A debate rather than a documented event, sourced to a blog and Wikipedia.",
    title: "2025 winter-or-bubble debate",
    startYear: 2025,
    eraId: "era_10_frontier",
    kind: "idea",
    publicStory:
      "Commentary in 2025 explicitly compared the investment climate to the overpromise pattern of 1974 and 1987. The museum records this as an open debate.",
    citations: [
      c("https://chrishood.com/the-ai-winter-road-historys-lessons-warn-of-todays-bubble/", "Chris Hood"),
      c("https://en.wikipedia.org/wiki/AI_winter", "Wikipedia"),
    ],
    editorialNote:
      "Disputed. Forbes returned 403 and is not cited. One 2025 commentary makes the comparison. The Wikipedia history records the earlier winters and does not itself declare a 2025 winter.",
    fieldChange: changed(
      "The downturns of 1974 and 1987 were history, and a 2025 comparison had not been filed on this wall.",
      "One 2025 commentary compares the investment climate to those years. The Wikipedia history of AI winters records the earlier periods. Neither page is a finding that a new winter has begun.",
      "https://chrishood.com/the-ai-winter-road-historys-lessons-warn-of-todays-bubble/",
      "https://en.wikipedia.org/wiki/AI_winter",
    ),
    confidence: "disputed",
    tags: ["open_debate"],
  },
  {
    id: "evt_2026_frontier_snapshot",
    withdrawnReason: "A perishable list of model names, expected to go out of date within weeks.",
    title: "September 2026 frontier model names",
    startYear: 2026,
    eraId: "era_10_frontier",
    kind: "system",
    publicStory:
      "OpenAI's own page, dated 9 July 2026, presents the GPT-5.6 family. Anthropic's own page presents Claude Opus 5.5. Names that appear only on aggregator sites are not listed.",
    citations: [
      c("https://openai.com/index/gpt-5-6/", "OpenAI"),
      c("https://www.anthropic.com/claude-opus-5-5", "Anthropic"),
    ],
    confidence: "reported",
    tags: ["perishable"],
    editorialNote:
      "Perishable. Not canon. Names and dates in this node are expected to be wrong within weeks. Aggregator pages are not cited. GPT-6, Gemini, and Kimi were not on a lab page opened for this edit, so they are omitted.",
    fieldChange: changed(
      "A September 2026 aggregator list named models this museum had not opened on the labs' own pages.",
      "The pages opened on 4 October 2026 are OpenAI's account of GPT-5.6 and Anthropic's account of Claude Opus 5.5.",
      "https://openai.com/index/gpt-5-6/",
      "https://www.anthropic.com/claude-opus-5-5",
    ),
    publicationState: "provisional",
    incomplete: true,
  },
];
