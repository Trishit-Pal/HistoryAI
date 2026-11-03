import type { Citation, Confidence, EraId, FieldChange, Figure, Kind, Layer, PublicationState } from "../domain/types";
import type { ClaimWrite, ExhibitWrite, SourceWrite, SupportLink } from "../store/memory";
import { MemoryStore } from "../store/memory";
import { ERA0_NODES } from "./era0";

const RETRIEVED = "2026-10-04";

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
    confidence: "reported",
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
      "An eight-week workshop that coined the term artificial intelligence and is widely regarded as the field's founding event. Newell and Simon presented the Logic Theorist.",
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
      "Dartmouth College's account says the name artificial intelligence was coined for the 1956 summer research project.",
      "https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth",
    ),
  },
  {
    id: "evt_1958_perceptron",
    title: "Rosenblatt's Perceptron",
    startYear: 1958,
    eraId: "era_2_symbolic",
    kind: "system",
    publicStory:
      "Frank Rosenblatt published the Perceptron, an early hardware neural-network learning system, amid press claims that went far beyond the demonstrated work.",
    citations: [
      c("https://doi.org/10.1037/h0042519", "Psychological Review"),
      c("https://en.wikipedia.org/wiki/Perceptron", "Wikipedia"),
    ],
    confidence: "reported",
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
    publicStory: "The DENDRAL project at Stanford is generally cited as the first expert system, identifying chemical structures.",
    citations: [
      c("https://doi.org/10.1016/0004-3702(93)90068-M", "Artificial Intelligence"),
      c("https://softwarepreservation.computerhistory.org/AI/DENDRAL/", "Computer History Museum"),
    ],
    confidence: "reported",
    tags: ["capability_breakthrough"],
    fieldChange: changed(
      "A program that proposed a chemical structure from instrument data was a hope, not a recorded project.",
      "The authors' 1993 case study describes DENDRAL as one of the first large programs to use detailed knowledge of organic chemistry to form hypotheses. The Computer History Museum keeps the project's papers.",
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
    confidence: "reported",
    tags: ["documented_failure"],
  },
  {
    id: "evt_1966_alpac",
    title: "ALPAC report",
    startYear: 1966,
    eraId: "era_2_symbolic",
    kind: "failure",
    publicStory:
      "The Automatic Language Processing Advisory Committee report found machine translation had not delivered, cutting U.S. government MT funding.",
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
    confidence: "reported",
    tags: ["funding"],
  },
  {
    id: "evt_1969_perceptrons",
    title: "Limits of the single-layer perceptron",
    startYear: 1969,
    eraId: "era_2_symbolic",
    kind: "failure",
    publicStory:
      "Minsky and Papert's Perceptrons proved formal limits of single-layer networks, including XOR, which chilled neural-network funding for years.",
    citations: [
      c("https://openlibrary.org/works/OL4981638W", "Open Library"),
      c("https://en.wikipedia.org/wiki/Perceptrons_(book)", "Wikipedia"),
    ],
    editorialNote:
      "The MIT Press page returned 403 and was not read. Open Library catalogues the 1969 book. The XOR limit is stated on the Wikipedia book page.",
    fieldChange: changed(
      "A single layer of neuron-like units was treated as a route to any classification that mattered.",
      "The Wikipedia account of Minsky and Papert's 1969 book states formal limits of a single-layer perceptron, including exclusive-or. Open Library catalogues that book.",
      "https://en.wikipedia.org/wiki/Perceptrons_(book)",
    ),
    confidence: "reported",
    tags: ["documented_failure"],
  },
  {
    id: "evt_1973_lighthill",
    title: "Lighthill Report",
    startYear: 1973,
    eraId: "era_3_first_winter",
    kind: "turning_point",
    publicStory:
      "The Lighthill Report to the UK Science Research Council concluded AI had failed to produce the promised major impact, triggering deep UK funding cuts.",
    citations: [
      c("https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf", "University of Edinburgh"),
      c("https://en.wikipedia.org/wiki/Lighthill_report", "Wikipedia"),
    ],
    fieldChange: changed(
      "UK support for artificial intelligence assumed the work would produce the impact that had been promised.",
      "Lighthill's survey, in the Edinburgh copy, says that in no part of the field had the discoveries produced the major impact that was then promised. The Chilton host did not answer, so it is not cited.",
      "https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf",
    ),
    confidence: "reported",
    tags: ["funding", "winter"],
  },
  {
    id: "evt_1974_first_winter",
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
    id: "evt_1997_deep_blue",
    title: "Deep Blue defeats Kasparov",
    startYear: 1997,
    eraId: "era_6_statistical",
    kind: "turning_point",
    publicStory:
      "IBM's Deep Blue defeated world chess champion Garry Kasparov, closing a games chapter opened at Dartmouth.",
    citations: [
      c("https://www.ibm.com/history/deep-blue", "IBM"),
      c("https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer)", "Wikipedia"),
    ],
    fieldChange: changed(
      "No chess computer had beaten a reigning world champion in a match under regular time controls.",
      "IBM's history says Deep Blue defeated Garry Kasparov in 1997, after Kasparov had won their 1996 match.",
      "https://www.ibm.com/history/deep-blue",
    ),
    confidence: "reported",
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2011_watson",
    title: "Watson wins Jeopardy!",
    startYear: 2011,
    eraId: "era_6_statistical",
    kind: "system",
    publicStory: "IBM Watson won Jeopardy! against human champions, a public demonstration of large-scale statistical NLP and retrieval.",
    citations: [
      c("https://www.ibm.com/history/watson-jeopardy", "IBM"),
      c("https://en.wikipedia.org/wiki/History_of_artificial_intelligence", "Wikipedia"),
    ],
    fieldChange: changed(
      "A question-answering system had not beaten the strongest human champions of a televised quiz on the air.",
      "IBM's history says Watson defeated Brad Rutter and Ken Jennings on Jeopardy! in February 2011.",
      "https://www.ibm.com/history/watson-jeopardy",
    ),
    confidence: "reported",
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2012_alexnet",
    title: "AlexNet at ILSVRC",
    startYear: 2012,
    eraId: "era_7_deep_learning",
    kind: "turning_point",
    publicStory:
      "AlexNet won the ImageNet Large Scale Visual Recognition Challenge, cutting the top-5 error rate from 26.2 percent to 15.3 percent with a GPU-trained convolutional network.",
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
    confidence: "reported",
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
    confidence: "reported",
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2015_google_photos",
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
    id: "evt_2016_tay",
    title: "Tay",
    startYear: 2016,
    eraId: "era_7_deep_learning",
    kind: "failure",
    publicStory:
      "Microsoft's Tay chatbot posted racist and extremist content within 16 hours of its March 2016 Twitter launch.",
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
    confidence: "reported",
    tags: ["documented_safety_failure"],
  },
  {
    id: "evt_2016_alphago",
    title: "AlphaGo versus Lee Sedol",
    startYear: 2016,
    eraId: "era_7_deep_learning",
    kind: "system",
    publicStory:
      "DeepMind's AlphaGo defeated Go player Lee Sedol 4–1. Game 2's Move 37 became a canonical case in debates about machine play that humans did not expect.",
    citations: [
      c("https://www.nature.com/articles/nature16961", "Nature"),
      c("https://en.wikipedia.org/wiki/Google_DeepMind", "Wikipedia"),
    ],
    fieldChange: changed(
      "A published Go program had not yet played a match against a player of Lee Sedol's standing.",
      "Nature's 2016 paper is the account of the network-and-search program. The 4–1 result against Lee Sedol is a later match that year; the DeepMind page is the secondary account of that match, not the January paper.",
      "https://www.nature.com/articles/nature16961",
      "https://en.wikipedia.org/wiki/Google_DeepMind",
    ),
    confidence: "reported",
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2017_transformer",
    title: "Attention Is All You Need",
    startYear: 2017,
    eraId: "era_8_transformers",
    kind: "system",
    publicStory:
      "Eight Google researchers published Attention Is All You Need, introducing the Transformer. The paper reports 28.4 BLEU on WMT-2014 English–German and 41.8 BLEU on English–French, trained in 3.5 days on eight GPUs. Authors are credited as equal contributors.",
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
    id: "evt_2017_transformer_citations",
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
    id: "evt_2020_alphafold",
    title: "AlphaFold2",
    startYear: 2020,
    eraId: "era_9_generative",
    kind: "system",
    publicStory:
      "DeepMind's AlphaFold2 made highly accurate protein-structure prediction from amino-acid sequence, a long-standing structural-biology challenge.",
    citations: [
      c("https://www.nature.com/articles/s41586-021-03819-2", "Nature"),
      c("https://en.wikipedia.org/wiki/AlphaFold", "Wikipedia"),
    ],
    fieldChange: changed(
      "A protein's folded shape was predicted from its sequence only approximately, and the hard targets at the structure contest were still mostly unsolved.",
      "The result shown at CASP14 in 2020 was published in Nature in 2021. The paper reports highly accurate structure prediction from amino-acid sequence. The plaque keeps 2020 as the year of that contest.",
      "https://www.nature.com/articles/s41586-021-03819-2",
    ),
    confidence: "reported",
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
    confidence: "reported",
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2023_cais",
    title: "Statement on AI Risk",
    startYear: 2023,
    eraId: "era_10_frontier",
    kind: "turning_point",
    publicStory:
      "The Center for AI Safety's one-sentence statement on extinction-scale AI risk was signed by hundreds of researchers and lab leaders. A 2023 survey of AI-conference researchers found 38 percent assigned at least a 10 percent probability to an extremely bad outcome conditional on human-level AI. That figure is a survey statistic, not a consensus forecast.",
    citations: [
      c("https://www.safe.ai/work/press-release-ai-risk", "Center for AI Safety"),
      c("https://arxiv.org/abs/2401.02843", "arXiv"),
    ],
    fieldChange: changed(
      "Extinction-scale risk from AI was a topic of talks, without one short public statement from lab leaders and without a counted survey of conference authors.",
      "The Center for AI Safety published a one-sentence statement on that risk. The 2023 survey paper says 38 percent of respondents put at least a 10 percent chance on extremely bad outcomes, such as human extinction, assuming high-level machine intelligence is built.",
      "https://www.safe.ai/work/press-release-ai-risk",
      "https://arxiv.org/abs/2401.02843",
    ),
    confidence: "reported",
    tags: ["open_debate"],
    officialPrimary: true,
  },
  {
    id: "evt_2024_eu_ai_act",
    title: "EU AI Act",
    startYear: 2024,
    eraId: "era_10_frontier",
    kind: "turning_point",
    publicStory:
      "Regulation (EU) 2024/1689 entered into force on 1 August 2024 as a horizontal AI law with a phased, risk-tiered timeline. Maximum penalty figures of up to €35 million or 7 percent of global annual turnover are reported for prohibited-practice breaches.",
    citations: [
      c("https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng", "EUR-Lex"),
      c("https://en.wikipedia.org/wiki/Artificial_Intelligence_Act", "Wikipedia"),
    ],
    fieldChange: changed(
      "Rules for AI systems in the European Union were national or sectoral, without one horizontal regulation in force.",
      "Regulation (EU) 2024/1689, on EUR-Lex, sets a fine of up to EUR 35 000 000 or 7 percent of worldwide annual turnover, whichever is higher, for non-compliance with the prohibited practices in Article 5. The plaque dates entry into force, not a later consolidated text.",
      "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    ),
    confidence: "reported",
    tags: ["regulation"],
  },
  {
    id: "evt_2024_nobel",
    title: "2024 Nobel Prizes in Physics and Chemistry",
    startYear: 2024,
    eraId: "era_10_frontier",
    kind: "turning_point",
    publicStory:
      "The Nobel Prize in Physics was awarded to John Hopfield and Geoffrey Hinton for work enabling machine learning with artificial neural networks. The Nobel Prize in Chemistry was awarded to Demis Hassabis and John Jumper, with David Baker, for protein-structure work including AlphaFold.",
    citations: [
      c("https://www.nobelprize.org/prizes/physics/2024/summary/", "Nobel Prize"),
      c("https://www.nobelprize.org/prizes/chemistry/2024/summary/", "Nobel Prize"),
    ],
    fieldChange: changed(
      "The physics and chemistry prizes had not been given for the machine-learning work named here.",
      "The Nobel Foundation's 2024 summaries award physics to John J. Hopfield and Geoffrey Hinton for discoveries that enable machine learning with artificial neural networks, and chemistry to David Baker, Demis Hassabis, and John Jumper for computational protein design and protein structure prediction.",
      "https://www.nobelprize.org/prizes/physics/2024/summary/",
      "https://www.nobelprize.org/prizes/chemistry/2024/summary/",
    ),
    confidence: "reported",
    tags: ["scientific_spillover"],
  },
  {
    id: "evt_2025_winter_debate",
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

function toWrite(node: SeedNode): ExhibitWrite {
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

export function seedMuseum(store = new MemoryStore()): MemoryStore {
  for (const node of SEED_NODES) {
    const result = store.apply(
      {
        exhibit: toWrite(node),
        claims: node.claims,
        sources: node.sources,
        supports: node.supports,
      },
      "editor",
    );
    if (!result.ok) {
      throw new Error(`Seed failed for ${node.id}: ${result.violations.map((v) => v.message).join("; ")}`);
    }
  }
  return store;
}
