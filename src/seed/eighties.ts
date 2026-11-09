import type { Citation, FieldChange } from "../domain/types";
import type { SeedNode } from "./eras";

// The owner-approved 1980–1993 rows of docs/superpowers/plans/2026-11-09-feedback-pass.md. Every URL was opened on this date.
// Each exhibit names its era: eraForYear(1980) would place R1 in the first winter, though the boom starts that year.
const RETRIEVED = "2026-11-09";

function cite(url: string, publisher: string): Citation {
  return { url, publisher, retrieved: RETRIEVED };
}

function changed(before: string, after: string, ...citationUrls: string[]): FieldChange {
  return { before, after, citationUrls };
}

const R1 = "https://cdn.aaai.org/AAAI/1980/AAAI80-076.pdf";
const XCON = "https://en.wikipedia.org/wiki/Xcon";
// ICOT's own archive, kept by Japan's National Institute of Advanced Industrial Science and Technology (AIST).
const ICOT_PREFACE = "https://www.airc.aist.go.jp/aitec-icot/ICOT/Museum/FinalEval/finaleval004.html";
const ICOT_SHAPIRO = "https://www.airc.aist.go.jp/aitec-icot/ICOT/Museum/FinalEval/finaleval093.html";
const FGCS = "https://en.wikipedia.org/wiki/Fifth_Generation_Computer_Systems";
const BACKPROP = "https://doi.org/10.1038/323533a0";
const BACKPROP_WIKI = "https://en.wikipedia.org/wiki/Backpropagation";

export const EIGHTIES_NODES: SeedNode[] = [
  {
    id: "evt_1980_r1",
    title: "R1 configures VAX computers",
    startYear: 1980,
    eraId: "era_4_expert_systems",
    kind: "system",
    publicStory:
      "John McDermott's R1, a rule-based program from Carnegie-Mellon University, checked customers' orders for Digital Equipment Corporation's VAX-11/780 computers and added the components they were missing. His 1980 paper says R1 had 772 rules and was in regular use by DEC's manufacturing organization. DEC also called it XCON.",
    citations: [cite(R1, "AAAI"), cite(XCON, "Wikipedia")],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
    editorialNote:
      "The paper describes R1 as it stood in June 1980 and says it is written in OPS4; the Wikipedia page says OPS5. The name XCON is from the Wikipedia page, not the paper.",
    fieldChange: changed(
      "Expert systems were built and run in research laboratories.",
      "McDermott's AAAI-80 paper says R1, with 772 rules, is used on a regular basis by DEC's manufacturing organization to configure VAX-11/780 orders.",
      R1,
    ),
  },
  {
    id: "evt_1982_fifth_generation",
    title: "Japan's Fifth Generation project begins",
    startYear: 1982,
    eraId: "era_4_expert_systems",
    kind: "institution",
    publicStory:
      "Japan's Institute for New Generation Computer Technology (ICOT) began the Fifth Generation Computer Systems project in 1982. It set out to combine highly parallel processing with knowledge information processing using logic programming, and to build a prototype computer that joined the two.",
    citations: [cite(ICOT_PREFACE, "ICOT archive, AIST"), cite(FGCS, "Wikipedia")],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["funding"],
    editorialNote:
      "The start year and aims are from ICOT's own preface to its 1992 evaluation workshop. The institute's full name is from the Wikipedia page.",
    fieldChange: changed(
      "Knowledge processing programs ran on conventional sequential computers.",
      "ICOT's preface says the project started in 1982 to combine highly parallel processing and knowledge information processing using logic programming, and to build a prototype integrating hardware and software.",
      ICOT_PREFACE,
    ),
  },
  {
    id: "evt_1986_backprop",
    title: "Backpropagation",
    startYear: 1986,
    eraId: "era_4_expert_systems",
    kind: "idea",
    publicStory:
      "David Rumelhart, Geoffrey Hinton and Ronald Williams described back-propagation in Nature: a procedure that repeatedly adjusts the weights of a network's connections to shrink the difference between its actual and desired outputs. Their paper shows hidden units, which are neither inputs nor outputs, coming to represent important features of the task.",
    citations: [cite(BACKPROP, "Nature"), cite(BACKPROP_WIKI, "Wikipedia")],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
    editorialNote:
      "Similar mathematics had been derived before 1986; the Wikipedia page traces that history. This exhibit records the 1986 paper, not the first derivation.",
    fieldChange: changed(
      "The perceptron-convergence procedure trained networks without hidden units that could learn features of their own.",
      "The 1986 Nature paper says the ability to create useful new features distinguishes back-propagation from earlier, simpler methods such as the perceptron-convergence procedure.",
      BACKPROP,
    ),
  },
  {
    id: "evt_1992_fgcs_evaluation",
    title: "The Fifth Generation project is evaluated",
    startYear: 1992,
    eraId: "era_5_second_winter",
    kind: "turning_point",
    publicStory:
      "Ten years after it began, ICOT presented the Fifth Generation project at its FGCS'92 conference in Tokyo and invited outside researchers to evaluate it. Ehud Shapiro's report from the evaluation workshop says every speaker praised its software, and most said the hardware it had built was of lesser long-term significance.",
    citations: [cite(ICOT_SHAPIRO, "ICOT archive, AIST"), cite(FGCS, "Wikipedia")],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["funding", "winter"],
    editorialNote:
      "ICOT's documents do not call the project a failure. The Wikipedia page says it ran until 1994 and ultimately ended in commercial failure.",
    fieldChange: changed(
      "Japan's national project was building custom parallel hardware for knowledge processing.",
      "Shapiro's June 1992 report says all speakers praised the project's software, and most claimed its hardware was of lesser long-term significance; some called investing so much in hardware a mistake.",
      ICOT_SHAPIRO,
    ),
  },
];
