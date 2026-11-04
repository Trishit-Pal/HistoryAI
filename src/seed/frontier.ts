import type { Citation, FieldChange } from "../domain/types";
import type { SeedNode } from "./eras";

// The owner-approved 2023–2026 rows of docs/research-2018-2026.md. Every URL was opened on this date.
// Epoch AI compute estimates belong to the Globe, not to these stories.
const RETRIEVED = "2026-11-04";

function cite(url: string, publisher: string): Citation {
  return { url, publisher, retrieved: RETRIEVED };
}

function changed(before: string, after: string, ...citationUrls: string[]): FieldChange {
  return { before, after, citationUrls };
}

function confirmed(node: Omit<SeedNode, "eraId" | "confidence" | "officialPrimary" | "tags">): SeedNode {
  return { ...node, eraId: "era_10_frontier", confidence: "confirmed", officialPrimary: true, tags: ["capability_breakthrough"] };
}

const LLAMA = "https://arxiv.org/abs/2302.13971";
const GPT4 = "https://arxiv.org/abs/2303.08774";
const QWEN = "https://github.com/QwenLM/Qwen";
const FALCON = "https://arxiv.org/abs/2311.16867";
const MISTRAL = "https://mistral.ai/news/announcing-mistral-7b";
const O1 = "https://cdn.openai.com/o1-system-card-20241205.pdf";
const DEEPSEEK_V3 = "https://arxiv.org/abs/2412.19437";
const R1_NATURE = "https://www.nature.com/articles/s41586-025-09422-z";
const ASTRA = "https://deploymentsafety.openai.com/gpt-6-astra";
const ASTRA_PRESS = "https://www.constellationr.com/insights/news/openai-launches-gpt-6-astra";
const SAME_ORG = "Both sources carry OpenAI's own document; the owner accepted the two OpenAI domains.";

export const FRONTIER_NODES: SeedNode[] = [
  confirmed({
    id: "evt_2023_llama",
    title: "LLaMA",
    startYear: 2023,
    kind: "system",
    publicStory:
      "Meta released LLaMA in February 2023 in four sizes from 7 to 65 billion parameters, trained only on publicly available data, under a noncommercial research licence. Its paper reports that the 13-billion-parameter version outperforms the 175-billion-parameter GPT-3 on most benchmarks.",
    citations: [cite(LLAMA, "arXiv"), cite("https://ai.meta.com/blog/large-language-model-llama-meta-ai/", "Meta AI")],
    fieldChange: changed(
      "The strongest language models were trained in part on data sets that were not publicly available.",
      "The 2023 paper trains models from 7 to 65 billion parameters on publicly available data alone, and reports that the 13-billion-parameter model outperforms GPT-3 on most benchmarks.",
      LLAMA,
    ),
  }),
  confirmed({
    id: "evt_2023_gpt4",
    title: "GPT-4",
    startYear: 2023,
    kind: "system",
    publicStory:
      "OpenAI's GPT-4 accepts images and text and produces text, and its technical report says it passed a simulated bar exam with a score around the top 10% of test takers. The report also says OpenAI predicted parts of GPT-4's performance from models trained with no more than 1/1,000th of its compute.",
    citations: [cite(GPT4, "arXiv"), cite("https://cdn.openai.com/papers/gpt-4.pdf", "OpenAI")],
    editorialNote: SAME_ORG,
    fieldChange: changed(
      "OpenAI's earlier GPT-3.5 scored around the bottom 10% of test takers on a simulated bar exam.",
      "OpenAI's 2023 technical report says GPT-4, which accepts images and text, passed the simulated bar exam with a score around the top 10% of test takers.",
      GPT4,
    ),
  }),
  confirmed({
    id: "evt_2023_qwen",
    title: "Qwen",
    startYear: 2023,
    kind: "system",
    publicStory:
      "Alibaba Cloud released its Qwen language models openly on ModelScope and Hugging Face, starting with Qwen-7B on 3 August 2023. The series grew to base and chat models of 1.8, 7, 14 and 72 billion parameters.",
    citations: [cite("https://arxiv.org/abs/2309.16609", "arXiv"), cite(QWEN, "Alibaba Cloud (QwenLM on GitHub)")],
    fieldChange: changed(
      "Alibaba Cloud had not released the weights of its Qwen language models.",
      "The QwenLM repository records the open release of Qwen-7B on ModelScope and Hugging Face on 3 August 2023, and base and chat models of 1.8, 7, 14 and 72 billion parameters.",
      QWEN,
    ),
  }),
  confirmed({
    id: "evt_2023_falcon",
    title: "Falcon-180B",
    startYear: 2023,
    kind: "system",
    publicStory:
      "The Technology Innovation Institute's Falcon-180B has 180 billion parameters and was trained on over 3.5 trillion tokens, which its authors call the largest openly documented pretraining run. TII released it under a permissive licence, alongside 7B and 40B models.",
    citations: [cite(FALCON, "arXiv"), cite("https://huggingface.co/tiiuae/falcon-180B", "Technology Innovation Institute (Hugging Face)")],
    editorialNote: "The model card gives no release date. The paper is from November 2023 and Epoch AI gives 6 September 2023.",
    fieldChange: changed(
      "No openly documented language-model pretraining run had used 3.5 trillion tokens.",
      "The Falcon paper says Falcon-180B was trained on over 3.5 trillion tokens, the largest openly documented pretraining run. TII released it with 7B and 40B models under a permissive licence.",
      FALCON,
    ),
  }),
  confirmed({
    id: "evt_2023_mistral_7b",
    title: "Mistral 7B",
    startYear: 2023,
    kind: "system",
    publicStory:
      "Mistral AI, a French company headquartered in Paris, released Mistral 7B, a 7.3-billion-parameter model, on 27 September 2023 under the Apache 2.0 licence, so anyone could use it without restrictions. The company says it outperforms Llama 2 13B on all benchmarks.",
    citations: [
      cite(MISTRAL, "Mistral AI"),
      cite("https://arxiv.org/abs/2310.06825", "arXiv"),
      cite("https://en.wikipedia.org/wiki/Mistral_AI", "Wikipedia"),
    ],
    editorialNote: "Neither Mistral source states the country; the Wikipedia article says the company is French and headquartered in Paris.",
    fieldChange: changed(
      "Llama 2 13B, with almost twice the parameters, was the open model Mistral 7B was measured against.",
      "Mistral AI's 27 September 2023 announcement releases the 7.3-billion-parameter Mistral 7B under Apache 2.0 and says it outperforms Llama 2 13B on all benchmarks.",
      MISTRAL,
    ),
  }),
  confirmed({
    id: "evt_2024_o1",
    title: "OpenAI o1",
    startYear: 2024,
    kind: "turning_point",
    publicStory:
      "OpenAI's o1 models are trained with large-scale reinforcement learning to reason using a chain of thought, so they can produce a long chain of thought before they answer. OpenAI's system card, dated 5 December 2024, says o1 was previously called o1-preview.",
    citations: [cite("https://arxiv.org/abs/2412.16720", "arXiv"), cite(O1, "OpenAI")],
    editorialNote: `${SAME_ORG} The arXiv copy was revised later; the story uses the original date.`,
    fieldChange: changed(
      "OpenAI's chat models were not trained to produce a long chain of thought before answering.",
      "OpenAI's o1 system card, dated 5 December 2024, says the o1 models are trained with large-scale reinforcement learning to reason using chain of thought.",
      O1,
    ),
  }),
  confirmed({
    id: "evt_2024_deepseek_v3",
    title: "DeepSeek-V3",
    startYear: 2024,
    kind: "system",
    publicStory:
      "DeepSeek-V3 is a mixture-of-experts model with 671 billion parameters, of which 37 billion are active for each token, pre-trained on 14.8 trillion tokens. Its report says full training took 2.788 million H800 GPU hours, and DeepSeek released the weights with commercial use allowed.",
    citations: [cite(DEEPSEEK_V3, "arXiv"), cite("https://github.com/deepseek-ai/DeepSeek-V3", "DeepSeek on GitHub")],
    fieldChange: changed(
      "A dense language model uses all of its parameters for every token.",
      "The DeepSeek-V3 report describes a mixture-of-experts model with 671 billion parameters, 37 billion active for each token, whose full training took 2.788 million H800 GPU hours.",
      DEEPSEEK_V3,
    ),
  }),
  confirmed({
    id: "evt_2025_deepseek_r1",
    title: "DeepSeek-R1",
    startYear: 2025,
    kind: "turning_point",
    publicStory:
      "DeepSeek showed that a language model's reasoning could be improved through reinforcement learning alone, without human-written reasoning examples, and published the work in Nature in September 2025. DeepSeek released R1's weights under the MIT licence and says R1 performs comparably to OpenAI's o1 on maths, code and reasoning.",
    citations: [
      cite("https://arxiv.org/abs/2501.12948", "arXiv"),
      cite(R1_NATURE, "Nature"),
      cite("https://github.com/deepseek-ai/DeepSeek-R1", "DeepSeek on GitHub"),
    ],
    editorialNote: "Nature 645, 633–638 (2025). The arXiv copy was revised later; the story uses the original dates.",
    fieldChange: changed(
      "Reasoning in language models was improved by training on human-written reasoning examples.",
      "The Nature paper reports that R1's reasoning was improved through reinforcement learning alone, without human-labelled reasoning examples.",
      R1_NATURE,
    ),
  }),
  confirmed({
    id: "evt_2026_gpt6_astra",
    title: "GPT-6 Astra",
    startYear: 2026,
    kind: "system",
    publicStory:
      "OpenAI's GPT-6 Astra system card (3 September 2026) calls it the most capable model OpenAI has ever broadly deployed, and the first to reach the Critical level of cybersecurity capability under its Preparedness Framework. Constellation Research reported that OpenAI launched it first to customers in its Daybreak program, before broad availability.",
    citations: [cite(ASTRA, "OpenAI Deployment Safety Hub"), cite(ASTRA_PRESS, "Constellation Research")],
    editorialNote:
      "The plaque states no hardware or GPU count: OpenAI's pages that could be opened do not name the hardware. Training compute is an Epoch AI estimate and appears only on the Globe.",
    fieldChange: changed(
      "No model OpenAI had deployed had reached the Critical level of cybersecurity capability under its Preparedness Framework.",
      "The 3 September 2026 system card says GPT-6 Astra is the first to reach that level. Constellation Research reports the same, calling Astra OpenAI's first launch with critical cybersecurity capability.",
      ASTRA,
      ASTRA_PRESS,
    ),
  }),
];
