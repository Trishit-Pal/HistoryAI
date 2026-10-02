import type { Citation, Confidence, EraId, Figure, Kind, Layer, PublicationState } from "../domain/types";
import type { ClaimWrite, ExhibitWrite, SourceWrite, SupportLink } from "../store/memory";
import { MemoryStore } from "../store/memory";
import { ERA0_NODES } from "./era0";

const RETRIEVED = "2026-09-27";

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
  noPredecessorInScope?: boolean;
  claims?: ClaimWrite[];
  sources?: SourceWrite[];
  supports?: SupportLink[];
};

function c(url: string, publisher: string): Citation {
  return { url, publisher, retrieved: RETRIEVED };
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
      c("https://en.wikipedia.org/wiki/Dartmouth_workshop", "Wikipedia"),
      c(
        "https://www.enterpriseaiworld.com/Articles/Editorial/Features/The-Rise-of-GenAI-and-LLMs-165796.aspx",
        "Enterprise AI World",
      ),
    ],
    confidence: "reported",
    tags: ["founding_event"],
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
    ],
    confidence: "confirmed",
    tags: ["founding_event", "capability_breakthrough"],
    officialPrimary: true,
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
      c("https://aitimeline.world/timeline/dartmouth-conference-1956", "AI Timeline"),
      c(
        "https://www.enterpriseaiworld.com/Articles/Editorial/Features/The-Rise-of-GenAI-and-LLMs-165796.aspx",
        "Enterprise AI World",
      ),
    ],
    confidence: "reported",
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_1965_dendral",
    title: "DENDRAL",
    startYear: 1965,
    eraId: "era_2_symbolic",
    kind: "system",
    publicStory: "The DENDRAL project at Stanford is generally cited as the first expert system, identifying chemical structures.",
    citations: [c("https://www.ailab.world/resources/ai-history/", "AI Lab")],
    confidence: "reported",
    tags: ["capability_breakthrough"],
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
      c("https://www.ailab.world/resources/ai-history/", "AI Lab"),
      c("https://mycours.es/gamedesign2012/?p=866", "Course note"),
    ],
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
    citations: [c("https://medium.com/@mariam22.ibekwe/the-ai-winter-94703b91709d", "Medium")],
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
      c(
        "https://www.enterpriseaiworld.com/Articles/Editorial/Features/The-Rise-of-GenAI-and-LLMs-165796.aspx",
        "Enterprise AI World",
      ),
    ],
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
      c("https://www.holloway.com/g/making-things-think/sections/the-first-ai-winter-19741980", "Holloway"),
    ],
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
      c("https://www.datacamp.com/blog/ai-winter", "DataCamp"),
      c("https://handwiki.org/wiki/AI_winter", "HandWiki"),
    ],
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
      "By 1985, corporations were reported to be spending over one billion dollars a year on in-house AI, supporting specialized hardware and software vendors.",
    citations: [
      c("https://chrishood.com/the-ai-winter-road-historys-lessons-warn-of-todays-bubble/", "Chris Hood"),
    ],
    confidence: "reported",
    tags: ["capability_breakthrough"],
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
      c("https://www.datacamp.com/blog/ai-winter", "DataCamp"),
      c("https://chrishood.com/the-ai-winter-road-historys-lessons-warn-of-todays-bubble/", "Chris Hood"),
    ],
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
      c("https://www.holloway.com/g/making-things-think/sections/the-first-ai-winter-19741980", "Holloway"),
    ],
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
    citations: [c("https://en.wikipedia.org/wiki/History_of_artificial_intelligence", "Wikipedia")],
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
      c("https://www.pinecone.io/learn/series/image-search/imagenet/", "Pinecone"),
      c("https://arxiv.org/pdf/2506.01311", "arXiv"),
    ],
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
    citations: [c("https://en.wikipedia.org/wiki/History_of_artificial_intelligence", "Wikipedia")],
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
    citations: [c("https://incidentdatabase.ai/reports/928", "AI Incident Database")],
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
      c("https://en.wikipedia.org/wiki/Google_DeepMind", "Wikipedia"),
      c("https://arxiv.org/pdf/2311.01609", "arXiv"),
    ],
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
  },
  {
    id: "evt_2017_transformer_citations",
    title: "Transformer citation-count claim",
    startYear: 2017,
    eraId: "era_8_transformers",
    kind: "idea",
    publicStory:
      "A secondary source reports that the Transformer paper is among the ten most-cited scientific papers of the century as of 2026.",
    citations: [
      c(
        "https://www.jerrycards.com/news/attention-is-all-you-need-2017-transformer-paper-birth-of-modern-ai",
        "Jerry Cards",
      ),
    ],
    confidence: "reported",
    tags: ["open_debate"],
    editorialNote: "Single secondary source. Not a citation-index primary. Do not treat as confirmed.",
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
    citations: [c("https://salesforcedevops.net/?p=40178", "Salesforce DevOps note")],
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
      "OpenAI released ChatGPT as a free research preview on 30 November 2022. Contemporaneous reports describe it as reaching 100 million users within two months.",
    citations: [
      c("https://en.wikipedia.org/wiki/ChatGPT", "Wikipedia"),
      c("https://timelines.issarice.com/wiki/Timeline_of_ChatGPT", "Issa Rice timelines"),
    ],
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
      c("https://arxiv.org/pdf/2511.10783", "arXiv"),
    ],
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
      c("https://casrai.org/ai-regulation/eu-ai-act", "CASRAI"),
      c("https://interworks.com/blog/2024/12/10/demystifying-the-eu-ai-act/", "InterWorks"),
    ],
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
      c(
        "https://aihub.org/2024/10/10/nobel-prizes-in-physics-and-chemistry-awarded-for-machine-learning-research",
        "AI Hub",
      ),
      c(
        "https://www.computing.co.uk/news/2024/ai/ai-pioneers-win-2024-nobel-prize-physics-chemistry",
        "Computing",
      ),
    ],
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
      c(
        "https://www.forbes.com/sites/paulocarvao/2025/08/24/are-we-heading-into-another-ai-winter/",
        "Forbes",
      ),
    ],
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
      "Aggregator pages in September 2026 listed named frontier systems including GPT-6 variants, Claude Opus 5.x, Gemini 3.x, and open-weight models such as Kimi K3. Those names go stale within weeks.",
    citations: [
      c("https://lukestahl.io/ai-models-guide/", "Luke Stahl"),
      c("https://llmgateway.io/timeline", "LLM Gateway"),
      c("https://blog.mean.ceo/new-ai-model-releases-news-april-2026/", "mean.ceo"),
    ],
    confidence: "reported",
    tags: ["perishable"],
    editorialNote:
      "Perishable aggregator copy. Not canon. Names and dates in this node are expected to be wrong within weeks.",
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
