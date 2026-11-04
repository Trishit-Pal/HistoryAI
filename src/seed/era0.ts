import type { Citation, ClaimRole, Figure } from "../domain/types";
import type { ClaimWrite, SourceWrite, SupportLink } from "../store/memory";
import type { SeedNode } from "./eras";

const RETRIEVED = "2026-10-02";

function cite(url: string, publisher: string): Citation {
  return { url, publisher, retrieved: RETRIEVED };
}

function plate(
  src: string,
  alt: string,
  credit: string,
  license: Figure["license"],
  sourceUrl: string,
  kind: Figure["kind"],
  sourceLabel: string,
  redrawnAfter?: string,
): Figure {
  return { src, alt, credit, license, sourceUrl, kind, sourceLabel, redrawnAfter };
}

const ROLES: ClaimRole[] = ["what_changed", "capability", "limit", "failure", "unknown"];

function technicalClaims(
  exhibitId: string,
  sourceId: string,
  statements: Record<ClaimRole, string>,
  failureStatus: "unknown" | "established" = "unknown",
): { claims: ClaimWrite[]; supports: SupportLink[] } {
  const claims = ROLES.map((role) => ({
    id: `${exhibitId}_${role}`,
    exhibitId,
    statement: statements[role],
    role,
    status: role === "failure" ? failureStatus : "established",
    publicationState: "canon" as const,
  }));
  const supports = claims.map((claim) => ({ claimId: claim.id, sourceId }));
  return { claims, supports };
}

const mccullochSource: SourceWrite = {
  id: "src_1943_mcculloch_pitts",
  title: "A logical calculus of the ideas immanent in nervous activity",
  year: 1943,
  authors: "Warren S. McCulloch and Walter Pitts",
  locator: "https://doi.org/10.1007/BF02478259",
  kind: "paper",
};

const shannonSource: SourceWrite = {
  id: "src_1948_shannon_information",
  title: "A Mathematical Theory of Communication",
  year: 1948,
  authors: "C. E. Shannon",
  locator: "https://doi.org/10.1002/j.1538-7305.1948.tb01338.x",
  kind: "paper",
};

const mcculloch = technicalClaims("evt_1943_mcculloch_pitts", mccullochSource.id, {
  what_changed:
    "The paper treats all-or-none neural events with propositional logic and defines nets whose behavior matches logical expressions.",
  capability:
    "For a logical expression meeting the paper's conditions, the calculus provides a net that behaves as that expression describes.",
  limit: "Nets that contain circles need more complicated logical means than the description used for nets without circles.",
  failure: "A technical failure is not established by the publisher abstract opened for this exhibit.",
  unknown:
    "The publisher abstract says applications of the calculus are discussed. It does not name a remaining open problem.",
});

const shannon = technicalClaims("tech_1948_shannon_information", shannonSource.id, {
  what_changed:
    "The opened text names five parts of a communication system: an information source, a transmitter, a channel, a receiver, and a destination.",
  capability: "The opened text says a finite set of equally likely messages can be measured by a logarithm of the number of messages.",
  limit: "The opened text sets semantic aspects of a message aside and treats the engineering problem as reproducing a selected message.",
  failure: "A technical failure is not established by the text extract opened for this exhibit.",
  unknown: "The opened text says the discrete noiseless case comes first and defers the continuous and mixed cases to the second half.",
});

const nilsson = cite("https://ai.stanford.edu/~nilsson/QAI/qai.pdf", "Nils J. Nilsson");
const openLibrary = cite("https://openlibrary.org/books/OL52346836M", "Open Library");
const shannon1938 = cite("https://doi.org/10.1109/t-aiee.1938.5057767", "IEEE");

export const ERA0_NODES: SeedNode[] = [
  {
    id: "ctx_1843_analytical_engine",
    title: "Sketch of the Analytical Engine",
    startYear: 1843,
    eraId: "era_0_precursors",
    kind: "idea",
    layer: "context",
    publicStory:
      "Menabrea's sketch of Babbage's Analytical Engine, translated with notes by Ada Lovelace, appeared in Taylor's Scientific Memoirs in 1843. Note G works through a table for the Bernoulli numbers.",
    citations: [
      cite("https://www.gutenberg.org/ebooks/75107", "Project Gutenberg"),
      cite(
        "https://en.wikisource.org/wiki/Scientific_Memoirs/3/Sketch_of_the_Analytical_Engine_invented_by_Charles_Babbage,_Esq.",
        "Wikisource",
      ),
      { url: "https://archive.org/details/india.history.resource.53369", publisher: "Internet Archive", retrieved: "2026-11-04" },
    ],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["precursor"],
    fieldChange: {
      before: "A calculating engine was discussed as a machine for tables, without a published general procedure written for it.",
      after:
        "The 1843 translation of Menabrea's sketch, with Lovelace's Note G, works through a table for the Bernoulli numbers on the Analytical Engine.",
      citationUrls: ["https://www.gutenberg.org/ebooks/75107", "https://archive.org/details/india.history.resource.53369"],
    },
    editorialNote:
      "Gutenberg and the Wikisource sketch page are transcriptions. The Internet Archive item is a scan of Scientific Memoirs volume III (1843), where the sketch begins on page 666 and Note G gives the Bernoulli table. The separate Wikisource Notes subpage returned 404, so it is not cited.",
    figure: plate(
      "/museum/era-0/bernoulli-note-g.jpg",
      "Note G diagram titled Diagram for the computation by the Engine of the Numbers of Bernoulli.",
      "Public-domain scan of the Bernoulli diagram. Wikimedia Commons file page states Public Domain Mark 1.0.",
      "PD-old",
      "https://commons.wikimedia.org/wiki/File:Diagram_for_the_computation_of_Bernoulli_numbers.jpg",
      "scan",
      "Wikimedia Commons",
    ),
  },
  {
    id: "ctx_1854_boole_laws_of_thought",
    title: "The Laws of Thought",
    startYear: 1854,
    eraId: "era_0_precursors",
    kind: "idea",
    layer: "context",
    publicStory:
      "The opened title page reads An Investigation of the Laws of Thought, on which are founded the Mathematical Theories of Logic and Probabilities, by George Boole, London: Walton and Maberly, Cambridge: Macmillan and Co., 1854.",
    citations: [
      cite("https://archive.org/details/aninvestigation00boolgoog", "Internet Archive"),
      cite(
        "https://en.wikisource.org/wiki/Page:An_Investigation_of_the_Laws_of_Thought_(1854,_Boole,_investigationofl00boolrich).djvu/5",
        "Wikisource",
      ),
    ],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["precursor"],
    fieldChange: {
      before: "Logic was taught as a verbal art, apart from the manipulation of algebraic equations.",
      after:
        "The opened 1854 title page presents Boole's book as an investigation of the laws of thought on which the mathematical theories of logic and probabilities are founded.",
      citationUrls: ["https://archive.org/details/aninvestigation00boolgoog"],
    },
    editorialNote:
      "The shipped scan is Internet Archive item aninvestigation00boolgoog, whose metadata says not in copyright in the US.",
    figure: plate(
      "/museum/era-0/boole-page.jpg",
      "Title page reading An Investigation of the Laws of Thought, by George Boole, London, Walton and Maberly, 1854.",
      "Title page of the 1854 edition. Public-domain scan from the Internet Archive.",
      "PD-US-expired",
      "https://archive.org/details/aninvestigation00boolgoog",
      "scan",
      "Internet Archive",
    ),
  },
  {
    id: "ctx_1936_turing_computable",
    title: "On Computable Numbers",
    startYear: 1936,
    eraId: "era_0_precursors",
    kind: "idea",
    layer: "context",
    publicStory:
      "A. M. Turing's On Computable Numbers, with an Application to the Entscheidungsproblem, appeared in the Proceedings of the London Mathematical Society, series 2, volume 42.",
    citations: [
      cite("https://doi.org/10.1112/plms/s2-42.1.230", "London Mathematical Society"),
      {
        url: "https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf",
        publisher: "University of Virginia",
        retrieved: "2026-10-04",
      },
    ],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["precursor"],
    fieldChange: {
      before:
        "The Entscheidungsproblem asked whether a definite method could decide every statement of a formal system, without a published account of what such a method was.",
      after:
        "Turing's paper in the Proceedings of the London Mathematical Society defines computable numbers by a machine and applies that definition to the Entscheidungsproblem.",
      citationUrls: ["https://doi.org/10.1112/plms/s2-42.1.230"],
    },
    editorialNote:
      "The opened Crossref record dates the print issue 1937. It does not give a received-in-1936 date. This room keeps 1936 as the working year.",
    figure: plate(
      "/museum/era-0/turing.svg",
      "A state table with rows q1 and q2 and columns for symbols 0 and 1.",
      "Original state-table diagram, redrawn after the London Mathematical Society paper. The opened record dates the print issue 1937. Not a scan.",
      "original",
      "https://doi.org/10.1112/plms/s2-42.1.230",
      "redrawn",
      "London Mathematical Society",
      "https://doi.org/10.1112/plms/s2-42.1.230",
    ),
  },
  {
    id: "ctx_1938_shannon_switching",
    title: "Relay and switching circuits",
    startYear: 1938,
    eraId: "era_0_precursors",
    kind: "idea",
    layer: "context",
    publicStory:
      "Claude Shannon's A Symbolic Analysis of Relay and Switching Circuits appeared in the Transactions of the American Institute of Electrical Engineers, volume 57, pages 713–723, in 1938.",
    citations: [
      shannon1938,
      {
        url: "https://www.cs.virginia.edu/~evans/greatworks/shannon38.pdf",
        publisher: "University of Virginia",
        retrieved: "2026-10-04",
      },
    ],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["precursor"],
    fieldChange: {
      before: "Relay circuits were drawn as electrical arrangements, and symbolic logic was a separate study.",
      after:
        "Shannon's 1938 paper gives a symbolic analysis of relay and switching circuits, in the Transactions of the AIEE, volume 57, pages 713–723.",
      citationUrls: [shannon1938.url],
    },
    editorialNote: "The DOI record was opened. The IEEE Xplore HTML was a bot challenge and was not read.",
    figure: plate(
      "/museum/era-0/shannon-1938.svg",
      "Two relay boxes in series with a lamp.",
      "Original relay diagram for this room. Not a copy of a figure from the 1938 paper.",
      "original",
      shannon1938.url,
      "redrawn",
      "IEEE",
      shannon1938.url,
    ),
  },
  {
    id: "evt_1943_mcculloch_pitts",
    title: "McCulloch–Pitts neuron",
    startYear: 1943,
    eraId: "era_0_precursors",
    kind: "idea",
    layer: "technical",
    publicStory:
      "McCulloch and Pitts published a calculus that treats all-or-none neural events with propositional logic and pairs logical expressions with nets.",
    technicalAccount:
      "The 1943 paper in the Bulletin of Mathematical Biophysics states that the all-or-none character of nervous activity lets neural events be treated by propositional logic. A net without circles has a description in that logic, and a logical expression meeting their conditions has a net that behaves as the expression describes. Nets with circles need further logical means.",
    citations: [
      cite("https://link.springer.com/article/10.1007/BF02478259", "Springer"),
      nilsson,
    ],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
    fieldChange: {
      before: "A neuron was described physiologically, and propositional logic was a separate calculus.",
      after:
        "The 1943 paper treats all-or-none neural events with propositional logic and pairs a logical expression with a net that behaves as that expression describes.",
      citationUrls: ["https://link.springer.com/article/10.1007/BF02478259"],
    },
    noPredecessorInScope: true,
    claims: mcculloch.claims,
    sources: [mccullochSource],
    supports: mcculloch.supports,
    figure: plate(
      "/museum/era-0/mcculloch.svg",
      "Two input circles joined by lines to one output circle.",
      "Original net diagram, redrawn after the 1943 paper. Not a copy of a journal figure.",
      "original",
      "https://link.springer.com/article/10.1007/BF02478259",
      "redrawn",
      "Springer",
      "https://doi.org/10.1007/BF02478259",
    ),
  },
  {
    id: "ctx_1948_wiener_cybernetics",
    title: "Cybernetics",
    startYear: 1948,
    eraId: "era_0_precursors",
    kind: "idea",
    layer: "context",
    publicStory:
      "A 1948 edition is catalogued as Norbert Wiener, Cybernetics; or, Control and communication in the animal and the machine, from The Technology Press. The Internet Archive scan cited here is the 1961 second edition from MIT Press, not the 1948 printing.",
    citations: [
      openLibrary,
      {
        url: "https://archive.org/details/cyberneticsorcon00wien",
        publisher: "Internet Archive",
        retrieved: "2026-10-04",
      },
    ],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["precursor"],
    fieldChange: {
      before: "Control in machines and communication in animals were catalogued as separate subjects.",
      after:
        "A 1948 edition is catalogued as Norbert Wiener, Cybernetics; or, Control and communication in the animal and the machine.",
      citationUrls: [openLibrary.url],
    },
    editorialNote:
      "Open Library's edition record was opened. A title page was not. The record does not name Hermann et Cie.",
    figure: plate(
      "/museum/era-0/wiener.svg",
      "A box labeled effector with a return path from its output back to its input.",
      "Original feedback diagram for this room. The catalog record has no figure to copy.",
      "original",
      openLibrary.url,
      "redrawn",
      "Open Library",
      openLibrary.url,
    ),
  },
  {
    id: "tech_1948_shannon_information",
    title: "A Mathematical Theory of Communication",
    startYear: 1948,
    eraId: "era_0_precursors",
    kind: "system",
    layer: "technical",
    publicStory:
      "Shannon's 1948 paper defines a communication system as information source, transmitter, channel, receiver, and destination, and measures a choice among messages with a logarithm.",
    technicalAccount:
      "The paper's text names five parts of a communication system: information source, transmitter, channel, receiver, and destination, and it places a noise source on the channel. A message is one selected from a set of possible messages. When that set is finite and choices are equally likely, the measure is a logarithm of the number of messages. The discrete noiseless case is developed before the continuous case.",
    citations: [
      cite("https://doi.org/10.1002/j.1538-7305.1948.tb01338.x", "Bell System Technical Journal"),
      cite("https://archive.org/details/bstj27-3-379", "Internet Archive"),
    ],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
    fieldChange: {
      before: "Communication engineering had no shared measure for a choice among possible messages.",
      after:
        "The 1948 paper names an information source, a transmitter, a channel, a receiver, and a destination, and it measures a finite set of equally likely messages by a logarithm of that number.",
      citationUrls: ["https://archive.org/details/bstj27-3-379"],
    },
    noPredecessorInScope: true,
    claims: shannon.claims,
    sources: [shannonSource],
    supports: shannon.supports,
    figure: plate(
      "/museum/era-0/shannon-1948.svg",
      "Five boxes in a row, labeled source, transmitter, channel, receiver, and destination, with a noise mark above the channel.",
      "Original diagram of the five parts named in the paper's text. Not a copy of the printed figure.",
      "original",
      "https://archive.org/details/bstj27-3-379",
      "redrawn",
      "Internet Archive",
      "https://archive.org/details/bstj27-3-379",
    ),
  },
];
