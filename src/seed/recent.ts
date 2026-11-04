import type { Citation, FieldChange } from "../domain/types";
import type { SeedNode } from "./eras";

// The owner-approved 2018–2022 rows of docs/research-2018-2026.md. Every URL was opened on this date.
const RETRIEVED = "2026-11-04";

function cite(url: string, publisher: string): Citation {
  return { url, publisher, retrieved: RETRIEVED };
}

function changed(before: string, after: string, ...citationUrls: string[]): FieldChange {
  return { before, after, citationUrls };
}

const BERT = "https://arxiv.org/abs/1810.04805";
const GPT2 = "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf";
const GPT3 = "https://arxiv.org/abs/2005.14165";
const WUDAO = "https://www.tsinghua.edu.cn/en/info/1245/10472.htm";
const CHINCHILLA = "https://arxiv.org/abs/2203.15556";

export const RECENT_NODES: SeedNode[] = [
  {
    id: "evt_2018_bert",
    title: "BERT",
    startYear: 2018,
    eraId: "era_8_transformers",
    kind: "system",
    publicStory:
      "Google's BERT pre-trained a Transformer on plain text, reading the words on both sides of each gap, then fine-tuned it to new state-of-the-art results on eleven language tasks. Google open-sourced it in November 2018, saying anyone could train a state-of-the-art question-answering system in about 30 minutes on a single Cloud TPU.",
    citations: [
      cite(BERT, "arXiv"),
      cite(
        "https://research.google/blog/open-sourcing-bert-state-of-the-art-pre-training-for-natural-language-processing/",
        "Google Research",
      ),
    ],
    fieldChange: changed(
      "Pre-trained language models read text in one direction, or joined a left-to-right model with a right-to-left one.",
      "The 2018 paper pre-trains a Transformer on the words to both sides at once, and reports new state-of-the-art results on eleven language tasks after fine-tuning.",
      BERT,
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2019_gpt2",
    title: "GPT-2",
    startYear: 2019,
    eraId: "era_8_transformers",
    kind: "system",
    publicStory:
      "OpenAI's GPT-2, a 1.5-billion-parameter Transformer trained on millions of web pages, set state-of-the-art results on 7 of 8 language-modelling datasets without being trained for any of them. OpenAI released it in stages.",
    citations: [cite(GPT2, "OpenAI"), cite("https://github.com/openai/gpt-2", "OpenAI on GitHub")],
    editorialNote:
      "Both sources are OpenAI's own; the owner accepted the two OpenAI domains. The paper PDF is undated: 2019 rests on the GitHub repository and the Epoch AI date of 14 February 2019.",
    fieldChange: changed(
      "Language tasks were approached by training a model on a labelled data set for each task.",
      "OpenAI's paper reports that a 1.5-billion-parameter model trained on WebText, a data set of millions of web pages, set state-of-the-art results on 7 of 8 language-modelling data sets without training on them.",
      GPT2,
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2020_gpt3",
    title: "GPT-3",
    startYear: 2020,
    eraId: "era_9_generative",
    kind: "system",
    publicStory:
      "OpenAI's GPT-3 has 175 billion parameters, which its paper calls 10 times more than any previous non-sparse language model. It performed many tasks from a few examples written as text, with no fine-tuning.",
    citations: [
      cite(GPT3, "arXiv"),
      cite(
        "https://proceedings.neurips.cc/paper/2020/hash/1457c0d6bfcb4967418bfb8ac142f64a-Abstract.html",
        "NeurIPS 2020 Proceedings",
      ),
    ],
    fieldChange: changed(
      "A language model needed a fine-tuning data set of thousands of labelled examples for each new task.",
      "The 2020 paper reports that GPT-3, with 175 billion parameters, performed many tasks from a few examples given as text, with no fine-tuning.",
      GPT3,
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2021_wudao2",
    title: "Wu Dao 2.0",
    startYear: 2021,
    eraId: "era_9_generative",
    kind: "system",
    publicStory:
      "Wu Dao 2.0, with 1.75 trillion parameters, was released in June 2021, and its creators say that is ten times as many as GPT-3. Tsinghua University says it understands and generates text and images in Chinese, English and other mainstream languages, and that its development was led by Jie Tang, a Tsinghua professor and vice director of academics at the Beijing Academy of Artificial Intelligence.",
    citations: [
      cite(WUDAO, "Tsinghua University"),
      cite("https://www.engadget.com/chinas-gigantic-multi-modal-ai-is-no-one-trick-pony-211414388.html", "Engadget"),
    ],
    editorialNote:
      "No page from the Beijing Academy of Artificial Intelligence was found, so the story says only what Tsinghua's page says. That page is undated and says the model was released in June; Engadget's report of 2 June 2021 dates the year.",
    fieldChange: changed(
      "China's first super-scale natural-language model had been unveiled in early 2021.",
      "Tsinghua's account says Wu Dao 2.0 was released in June with 1.75 trillion parameters, which its creators put at ten times GPT-3.",
      WUDAO,
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
  {
    id: "evt_2022_chinchilla",
    title: "Chinchilla",
    startYear: 2022,
    eraId: "era_9_generative",
    kind: "turning_point",
    publicStory:
      "DeepMind found that large language models were undertrained, and that model size and training data should grow together. Its 70-billion-parameter Chinchilla used the same compute as the 280-billion-parameter Gopher with four times the data, and outperformed Gopher, GPT-3 and Megatron-Turing NLG on a large range of tasks.",
    citations: [
      cite(CHINCHILLA, "arXiv"),
      cite(
        "https://deepmind.google/discover/blog/an-empirical-analysis-of-compute-optimal-large-language-model-training/",
        "Google DeepMind",
      ),
    ],
    fieldChange: changed(
      "Language models were being scaled up in size while the amount of training data stayed about the same.",
      "The 2022 paper finds that model size and training tokens should be scaled equally. Chinchilla, with 70 billion parameters and four times Gopher's data for the same compute, outperforms Gopher.",
      CHINCHILLA,
    ),
    confidence: "confirmed",
    officialPrimary: true,
    tags: ["capability_breakthrough"],
  },
];
