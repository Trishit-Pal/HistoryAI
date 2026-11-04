import type { Citation, Confidence, EraId, FieldChange, Figure, Kind, Layer, PublicationState } from "../domain/types";
import type { ClaimWrite, ExhibitWrite, SourceWrite, SupportLink, Write } from "../store/memory";
import { MemoryStore } from "../store/memory";
import { ERA0_NODES } from "./era0";
import { WITHDRAWN_NODES } from "./withdrawn";

const RETRIEVED = "2026-10-04";
const AUDITED = "2026-11-04";

export type SeedNode = {
  id: string;
  title: string;
  startYear: number;
  kind?: Kind;
  eraId: EraId;
  publicStory: string;
  citations: Citation[];
  confidence: Confidence;
  tags: string[];
  officialPrimary?: boolean;
  editorialNote?: string;
  publicationState?: PublicationState;
  incomplete?: boolean;
  endYear?: number;
  layer?: Layer;
  figure?: Figure;
  technicalAccount?: string;
  fieldChange?: FieldChange;
  noPredecessorInScope?: boolean;
  claims?: ClaimWrite[];
  sources?: SourceWrite[];
  supports?: SupportLink[];
};

function c(url: string, publisher: string): Citation {
  return { url, publisher, retrieved: RETRIEVED };
}

/** A URL added and opened by the November 2026 accuracy audit. */
function audited(url: string, publisher: string): Citation {
  return { url, publisher, retrieved: AUDITED };
}

function changed(before: string, after: string, ...citationUrls: string[]): FieldChange {
  return { before, after, citationUrls };
}

export const SEED_NODES: SeedNode[] = [
  ...ERA0_NODES,
  {
    id: "evt_1950_turing",
    title: "Turing's imitation game",
    startYear: 1950,
    eraId: "era_1_founding",
    kind: "idea",
    publicStory:
      "Alan Turing published Computing Machinery and Intelligence in Mind, proposing the Imitation Game as an operational stand-in for whether machines can think.",
    citations: [
      c("https://doi.org/10.1093/mind/LIX.236.433", "Mind"),
      c("https://en.wikipedia.org/wiki/Computing_Machinery_and_Intelligence", "Wikipedia"),
    ],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["founding_event"],
    fieldChange: changed(
      "Asking whether a machine can think had no agreed operation that would settle the question.",
      "Turing's 1950 paper in Mind proposes the imitation game as a stand-in for that question.",
      "https://doi.org/10.1093/mind/LIX.236.433",
    ),
  },
  {
    id: "evt_1956_dartmouth",
    title: "Dartmouth Summer Research Project on Artificial Intelligence",
    startYear: 1956,
    eraId: "era_1_founding",
    kind: "turning_point",
    publicStory:
      "A summer workshop at Dartmouth, proposed in August 1955 as a “2 month, 10 man study of artificial intelligence”; the proposal's title introduced the term. It is widely regarded as the field's founding event.",
    citations: [
      c("https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth", "Dartmouth College"),
      c("https://en.wikipedia.org/wiki/Dartmouth_workshop", "Wikipedia"),
      c("http://jmc.stanford.edu/articles/dartmouth/dartmouth.pdf", "John McCarthy"),
    ],
    confidence: "confirmed",
    tags: ["founding_event", "capability_breakthrough"],
    officialPrimary: true,
    fieldChange: changed(
      "Research on machines and intelligence had no common name.",
      "The 31 August 1955 proposal, A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence, asks for a 2 month, 10 man study of artificial intelligence.",
      "http://jmc.stanford.edu/articles/dartmouth/dartmouth.pdf",
    ),
  },
  {
    id: "evt_1958_perceptron",
    title: "Rosenblatt's Perceptron",
    startYear: 1958,
    eraId: "era_2_symbolic",
    kind: "system",
    publicStory:
      "Frank Rosenblatt published the Perceptron, a probabilistic model of a learning network.",
    citations: [
      c("https://doi.org/10.1037/h0042519", "Psychological Review"),
      c("https://en.wikipedia.org/wiki/Perceptron", "Wikipedia"),
    ],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
    fieldChange: changed(
      "A learning machine was a proposal, not a published model with a training rule.",
      "Rosenblatt's 1958 paper presents the perceptron as a probabilistic model for storing and organizing information.",
      "https://doi.org/10.1037/h0042519",
    ),
  },
  {
    id: "evt_1965_dendral",
    title: "DENDRAL",
    startYear: 1965,
    eraId: "era_2_symbolic",
    kind: "system",
    publicStory: "The DENDRAL project at Stanford identified chemical structures. Its builders' 1993 case study calls it the first expert system for scientific hypothesis formation.",
    citations: [
      c("https://doi.org/10.1016/0004-3702(93)90068-M", "Artificial Intelligence"),
      c("https://softwarepreservation.computerhistory.org/AI/DENDRAL/", "Computer History Museum"),
    ],
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
    fieldChange: changed(
      "A program that proposed a chemical structure from instrument data was a hope, not a recorded project.",
      "The builders' 1993 case study calls DENDRAL the first expert system for scientific hypothesis formation. The Computer History Museum keeps the project's papers.",
      "https://doi.org/10.1016/0004-3702(93)90068-M",
    ),
  },
  {
    id: "evt_1966_eliza",
    title: "ELIZA",
    startYear: 1966,
    eraId: "era_2_symbolic",
    kind: "system",
    publicStory:
      "Joseph Weizenbaum built ELIZA, a pattern-matching conversational program. Many users treated it as understanding them, a documented case of over-attribution later called the Eliza effect.",
    citations: [
      c("https://dl.acm.org/doi/10.1145/365153.365168", "Communications of the ACM"),
      c("https://en.wikipedia.org/wiki/ELIZA", "Wikipedia"),
    ],
    fieldChange: changed(
      "A program that answered in sentences was easy to treat as a program that understood the person typing.",
      "Weizenbaum's 1966 paper describes ELIZA as keyword rules that transform a sentence, and he writes that the relation of appearance to reality stays with the playwright.",
      "https://dl.acm.org/doi/10.1145/365153.365168",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["documented_failure"],
  },
  {
    id: "evt_1966_alpac",
    title: "ALPAC report",
    startYear: 1966,
    eraId: "era_2_symbolic",
    kind: "failure",
    publicStory:
      "The Automatic Language Processing Advisory Committee report found machine translation had not delivered, after which U.S. government MT funding was sharply reduced.",
    citations: [
      c(
        "https://nap.nationalacademies.org/catalog/9547/language-and-machines-computers-in-translation-and-linguistics",
        "National Academies Press",
      ),
      c("https://en.wikipedia.org/wiki/ALPAC", "Wikipedia"),
    ],
    fieldChange: changed(
      "U.S. agencies were funding machine translation in the expectation of a working system.",
      "The 1966 National Academies report, Language and Machines, is the committee's published finding that machine translation had not delivered what that funding assumed.",
      "https://nap.nationalacademies.org/catalog/9547/language-and-machines-computers-in-translation-and-linguistics",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["funding"],
  },
  {
    id: "evt_1969_perceptrons",
    title: "Limits of the single-layer perceptron",
    startYear: 1969,
    eraId: "era_2_symbolic",
    kind: "failure",
    publicStory:
      "Minsky and Papert's Perceptrons proved formal limits of single-layer networks, including XOR.",
    citations: [
      c("https://openlibrary.org/works/OL4981638W", "Open Library"),
      c("https://en.wikipedia.org/wiki/Perceptrons_(book)", "Wikipedia"),
      audited("https://doi.org/10.7551/mitpress/11301.001.0001", "MIT Press (2017 reissue)"),
    ],
    editorialNote:
      "The MIT Press DOI is the 2017 reissue of the book; its page returned 403 and was not read. Open Library catalogues the 1969 printing. The XOR limit is also stated on the Wikipedia book page.",
    fieldChange: changed(
      "A single layer of neuron-like units was treated as a route to any classification that mattered.",
      "Minsky and Papert's book, cited here in the MIT Press 2017 reissue, states formal limits of a single-layer perceptron, including exclusive-or. Open Library catalogues the 1969 printing.",
      "https://doi.org/10.7551/mitpress/11301.001.0001",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["documented_failure"],
  },
  {
    id: "evt_1973_lighthill",
    title: "Lighthill Report",
    startYear: 1973,
    eraId: "era_3_first_winter",
    kind: "turning_point",
    publicStory:
      "The Lighthill Report to the UK Science Research Council concluded AI had failed to produce the promised major impact, and was followed by deep UK funding cuts.",
    citations: [
      c("https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf", "University of Edinburgh"),
      c("https://en.wikipedia.org/wiki/Lighthill_report", "Wikipedia"),
    ],
    fieldChange: changed(
      "UK support for artificial intelligence assumed the work would produce the impact that had been promised.",
      "Lighthill's survey, in the Edinburgh copy, says that in no part of the field had the discoveries produced the major impact that was then promised. The Chilton host did not answer, so it is not cited.",
      "https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["funding", "winter"],
    editorialNote:
      "The report is dated July 1972 and was published in 1973. The funding cuts that followed are stated on the Wikipedia page, not in the report.",
  },
  {
    id: "evt_1997_deep_blue",
    title: "Deep Blue defeats Kasparov",
    startYear: 1997,
    eraId: "era_6_statistical",
    kind: "turning_point",
    publicStory:
      "IBM's Deep Blue defeated world chess champion Garry Kasparov.",
    citations: [
      c("https://www.ibm.com/history/deep-blue", "IBM"),
      c("https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer)", "Wikipedia"),
    ],
    fieldChange: changed(
      "No chess computer had beaten a reigning world champion in a match under regular time controls.",
      "IBM's history says Deep Blue defeated Garry Kasparov in 1997, after Kasparov had won their 1996 match.",
      "https://www.ibm.com/history/deep-blue",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2011_watson",
    title: "Watson wins Jeopardy!",
    startYear: 2011,
    eraId: "era_6_statistical",
    kind: "system",
    publicStory: "IBM Watson won Jeopardy! against the champions Brad Rutter and Ken Jennings in February 2011.",
    citations: [
      c("https://www.ibm.com/history/watson-jeopardy", "IBM"),
      c("https://en.wikipedia.org/wiki/History_of_artificial_intelligence", "Wikipedia"),
    ],
    fieldChange: changed(
      "A question-answering system had not beaten the strongest human champions of a televised quiz on the air.",
      "IBM's history says Watson defeated Brad Rutter and Ken Jennings on Jeopardy! in February 2011.",
      "https://www.ibm.com/history/watson-jeopardy",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2012_alexnet",
    title: "AlexNet at ILSVRC",
    startYear: 2012,
    eraId: "era_7_deep_learning",
    kind: "turning_point",
    publicStory:
      "AlexNet won the ImageNet Large Scale Visual Recognition Challenge with a GPU-trained convolutional network, with a top-5 error rate of 15.3 percent, against 26.2 percent for the second-best entry.",
    citations: [
      c(
        "https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf",
        "NeurIPS",
      ),
      c("https://www.pinecone.io/learn/series/image-search/imagenet/", "Pinecone"),
    ],
    fieldChange: changed(
      "The next-best ImageNet entry in 2012 still relied on engineered features, with a top-5 error of 26.2 percent.",
      "The NeurIPS 2012 paper reports that an average of convolutional networks reached 15.3 percent top-5 error on ILSVRC-2012.",
      "https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2014_gan",
    title: "Generative adversarial networks",
    startYear: 2014,
    eraId: "era_7_deep_learning",
    kind: "system",
    publicStory: "Goodfellow and colleagues introduced generative adversarial networks.",
    citations: [
      c("https://arxiv.org/abs/1406.2661", "arXiv"),
      c("https://en.wikipedia.org/wiki/Generative_adversarial_network", "Wikipedia"),
    ],
    fieldChange: changed(
      "A generator of new samples was trained to match a data set, without a second network trained to tell real from generated.",
      "The 2014 paper proposes two models trained together: a generator, and a discriminator that estimates whether a sample came from the training data.",
      "https://arxiv.org/abs/1406.2661",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2016_tay",
    title: "Tay",
    startYear: 2016,
    eraId: "era_7_deep_learning",
    kind: "failure",
    publicStory:
      "Microsoft took its Tay chatbot offline within a day of its March 2016 Twitter launch, after Tay posted what Microsoft called wildly inappropriate and reprehensible words and images.",
    citations: [
      c("https://blogs.microsoft.com/blog/2016/03/25/learning-tays-introduction/", "Microsoft"),
      c("https://incidentdatabase.ai/reports/928", "AI Incident Database"),
    ],
    fieldChange: changed(
      "A public chatbot was launched on the assumption that conversation on the open internet would stay inside the filters shipped with it.",
      "Microsoft's 25 March 2016 post is the team's account of taking Tay offline. The incident report dates the offensive posts to about 16 hours after the Twitter launch.",
      "https://blogs.microsoft.com/blog/2016/03/25/learning-tays-introduction/",
      "https://incidentdatabase.ai/reports/928",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["documented_safety_failure"],
  },
  {
    id: "evt_2016_alphago",
    title: "AlphaGo versus Lee Sedol",
    startYear: 2016,
    eraId: "era_7_deep_learning",
    kind: "system",
    publicStory:
      "DeepMind's AlphaGo defeated Go player Lee Sedol 4–1 in Seoul in March 2016. In game two it played Move 37, which DeepMind's account says upended centuries of traditional wisdom.",
    citations: [
      c("https://www.nature.com/articles/nature16961", "Nature"),
      c("https://en.wikipedia.org/wiki/Google_DeepMind", "Wikipedia"),
      audited("https://deepmind.google/research/breakthroughs/alphago/", "Google DeepMind"),
    ],
    fieldChange: changed(
      "A published Go program had not yet played a match against a player of Lee Sedol's standing.",
      "Nature's January 2016 paper is the account of the network-and-search program. DeepMind's own page is the record of the later match: a 4–1 win over Lee Sedol in Seoul in March 2016.",
      "https://www.nature.com/articles/nature16961",
      "https://deepmind.google/research/breakthroughs/alphago/",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2017_transformer",
    title: "Attention Is All You Need",
    startYear: 2017,
    eraId: "era_8_transformers",
    kind: "system",
    publicStory:
      "Eight researchers at Google Brain and Google Research (one listed at the University of Toronto, with work performed at Google) published Attention Is All You Need, introducing the Transformer. The paper reports 28.4 BLEU on WMT-2014 English–German and 41.8 BLEU on English–French after 3.5 days of training on eight GPUs. Authors are credited as equal contributors.",
    citations: [
      c("https://arxiv.org/abs/1706.03762", "arXiv"),
      c("https://en.wikipedia.org/wiki/Attention_Is_All_You_Need", "Wikipedia"),
    ],
    confidence: "confirmed",
    tags: ["capability_breakthrough"],
    officialPrimary: true,
    fieldChange: changed(
      "The strongest translation models were recurrent or convolutional networks, with attention as a connection between an encoder and a decoder.",
      "The paper proposes a network that uses attention alone, and it reports 28.4 BLEU on WMT 2014 English-to-German and 41.8 BLEU on English-to-French after 3.5 days on eight GPUs.",
      "https://arxiv.org/abs/1706.03762",
    ),
  },
  {
    id: "evt_2020_alphafold",
    title: "AlphaFold2",
    startYear: 2020,
    eraId: "era_9_generative",
    kind: "system",
    publicStory:
      "DeepMind's AlphaFold2 made highly accurate protein-structure prediction from amino-acid sequence possible, a long-standing structural-biology challenge.",
    citations: [
      c("https://www.nature.com/articles/s41586-021-03819-2", "Nature"),
      c("https://en.wikipedia.org/wiki/AlphaFold", "Wikipedia"),
    ],
    fieldChange: changed(
      "A protein's folded shape was predicted from its sequence only approximately, and the hard targets at the structure contest were still mostly unsolved.",
      "The result shown at CASP14 in 2020 was published in Nature in 2021. The paper reports highly accurate structure prediction from amino-acid sequence. The plaque keeps 2020 as the year of that contest.",
      "https://www.nature.com/articles/s41586-021-03819-2",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["scientific_spillover"],
  },
  {
    id: "evt_2022_chatgpt",
    title: "ChatGPT research preview",
    startYear: 2022,
    eraId: "era_9_generative",
    kind: "system",
    publicStory:
      "OpenAI released ChatGPT as a free research preview on 30 November 2022.",
    citations: [
      c("https://openai.com/index/chatgpt/", "OpenAI"),
      c("https://en.wikipedia.org/wiki/ChatGPT", "Wikipedia"),
    ],
    editorialNote:
      "The 100 million users clause was removed. No news page stating that figure was opened. The OpenAI post is the 30 November 2022 announcement.",
    fieldChange: changed(
      "A large language model was available through an API and demos, not as a free conversational research preview.",
      "OpenAI's 30 November 2022 post introduces ChatGPT as a free research preview, trained to answer in dialogue.",
      "https://openai.com/index/chatgpt/",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2023_cais",
    title: "Statement on AI Risk",
    startYear: 2023,
    eraId: "era_10_frontier",
    kind: "turning_point",
    publicStory:
      "The Center for AI Safety's one-sentence statement on extinction-scale AI risk was signed by AI researchers and the heads of major labs. A survey of AI-conference authors, published in January 2024, found that between 38 and 51 percent of respondents gave at least a 10 percent chance to advanced AI leading to outcomes as bad as human extinction. That range is a survey statistic, not a consensus forecast.",
    citations: [
      c("https://www.safe.ai/work/press-release-ai-risk", "Center for AI Safety"),
      c("https://arxiv.org/abs/2401.02843", "arXiv"),
    ],
    fieldChange: changed(
      "Extinction-scale risk from AI was a topic of talks, without one short public statement from lab leaders and without a counted survey of conference authors.",
      "The Center for AI Safety published a one-sentence statement on that risk. The survey paper, published in January 2024, says between 38 and 51 percent of respondents gave at least a 10 percent chance to advanced AI leading to outcomes as bad as human extinction.",
      "https://www.safe.ai/work/press-release-ai-risk",
      "https://arxiv.org/abs/2401.02843",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["open_debate"],
  },
  {
    id: "evt_2024_eu_ai_act",
    title: "EU AI Act",
    startYear: 2024,
    eraId: "era_10_frontier",
    kind: "turning_point",
    publicStory:
      "Regulation (EU) 2024/1689 entered into force on 1 August 2024 as a horizontal AI law with a phased, risk-tiered timeline. The regulation sets fines of up to €35 million or 7 percent of worldwide annual turnover, whichever is higher, for breaches of the Article 5 prohibitions.",
    citations: [
      c("https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng", "EUR-Lex"),
      c("https://en.wikipedia.org/wiki/Artificial_Intelligence_Act", "Wikipedia"),
    ],
    fieldChange: changed(
      "Rules for AI systems in the European Union were national or sectoral, without one horizontal regulation in force.",
      "Regulation (EU) 2024/1689, on EUR-Lex, sets a fine of up to EUR 35 000 000 or 7 percent of worldwide annual turnover, whichever is higher, for non-compliance with the prohibited practices in Article 5. The plaque dates entry into force, not a later consolidated text.",
      "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["regulation"],
  },
  {
    id: "evt_2024_nobel",
    title: "2024 Nobel Prizes in Physics and Chemistry",
    startYear: 2024,
    eraId: "era_10_frontier",
    kind: "turning_point",
    publicStory:
      "The Nobel Prize in Physics was awarded to John Hopfield and Geoffrey Hinton for work enabling machine learning with artificial neural networks. The Nobel Prize in Chemistry was awarded half to David Baker for computational protein design, and half jointly to Demis Hassabis and John Jumper for protein structure prediction.",
    citations: [
      c("https://www.nobelprize.org/prizes/physics/2024/summary/", "Nobel Prize"),
      c("https://www.nobelprize.org/prizes/chemistry/2024/summary/", "Nobel Prize"),
      audited("https://www.kva.se/en/news/nobelpriset-i-fysik-2024/", "Royal Swedish Academy of Sciences"),
      audited("https://www.kva.se/en/news/nobelpriset-i-kemi-2024/", "Royal Swedish Academy of Sciences"),
    ],
    fieldChange: changed(
      "The physics and chemistry prizes had not been given for the machine-learning work named here.",
      "The Nobel Foundation's 2024 summaries award physics to John J. Hopfield and Geoffrey Hinton for discoveries that enable machine learning with artificial neural networks, and chemistry half to David Baker for computational protein design and half jointly to Demis Hassabis and John Jumper for protein structure prediction. The Royal Swedish Academy of Sciences says Hassabis and Jumper developed AlphaFold2.",
      "https://www.kva.se/en/news/nobelpriset-i-kemi-2024/",
      "https://www.nobelprize.org/prizes/physics/2024/summary/",
      "https://www.nobelprize.org/prizes/chemistry/2024/summary/",
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["scientific_spillover"],
  },
];

export function toWrite(node: SeedNode): ExhibitWrite {
  return {
    id: node.id,
    title: node.title,
    kind: node.kind ?? "turning_point",
    startYear: node.startYear,
    publicStory: node.publicStory,
    publicationState: node.publicationState ?? "canon",
    incomplete: node.incomplete ?? false,
    layer: node.layer ?? "context",
    eraId: node.eraId,
    confidence: node.confidence,
    citations: node.citations,
    tags: node.tags,
    officialPrimary: node.officialPrimary,
    editorialNote: node.editorialNote,
    endYear: node.endYear,
    figure: node.figure,
    technicalAccount: node.technicalAccount,
    fieldChange: node.fieldChange,
    noPredecessorInScope: node.noPredecessorInScope,
  };
}

function applyOrThrow(store: MemoryStore, id: string, write: Write): void {
  const result = store.apply(write, "editor");
  if (!result.ok) {
    throw new Error(`Seed failed for ${id}: ${result.violations.map((v) => v.message).join("; ")}`);
  }
}

export function seedMuseum(store = new MemoryStore()): MemoryStore {
  for (const node of SEED_NODES) {
    applyOrThrow(store, node.id, {
      exhibit: toWrite(node),
      claims: node.claims,
      sources: node.sources,
      supports: node.supports,
    });
  }
  // Withdrawn exhibits are written as first published, then withdrawn, so the changelog records both.
  for (const node of WITHDRAWN_NODES) {
    applyOrThrow(store, node.id, { exhibit: toWrite(node) });
    applyOrThrow(store, node.id, {
      exhibit: { ...toWrite(node), publicationState: "withdrawn" },
      reason: `Withdrawn: ${node.withdrawnReason}`,
    });
  }
  return store;
}
