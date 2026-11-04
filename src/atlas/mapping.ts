export interface Landmark {
  /** The `Model` string in Epoch's data, spelled exactly. A test checks it against the snapshot. */
  readonly model: string;
  /** The museum exhibit this model belongs to. Models without an exhibit are labelled but not linked. */
  readonly exhibitId?: string;
}

/**
 * Matched by hand against Epoch's names; fuzzy matching put labels on the wrong models (GPT-3.5
 * Turbo for ChatGPT, ResNet variants for ResNet). Exhibits with no Epoch row (McCulloch-Pitts,
 * ELIZA, DENDRAL, Watson, Tay, ChatGPT) are not plotted.
 */
export const LANDMARKS: readonly Landmark[] = [
  { model: "Perceptron Mark I", exhibitId: "evt_1958_perceptron" },
  { model: "Deep Blue", exhibitId: "evt_1997_deep_blue" },
  { model: "AlexNet", exhibitId: "evt_2012_alexnet" },
  { model: "GANs", exhibitId: "evt_2014_gan" },
  { model: "AlphaGo Lee", exhibitId: "evt_2016_alphago" },
  { model: "Transformer", exhibitId: "evt_2017_transformer" },
  { model: "AlphaFold 2", exhibitId: "evt_2020_alphafold" },
  { model: "Wu Dao 2.0", exhibitId: "evt_2021_wudao2" },

  { model: "Theseus" },
  { model: "Samuel Neural Checkers" },
  { model: "Neocognitron" },
  { model: "TD-Gammon" },
  { model: "LSTM" },
  { model: "Word2Vec (large)" },
  { model: "DQN" },
  { model: "ResNet-152 (ImageNet)" },
  { model: "AlphaGo Zero" },
  { model: "GPT-1" },
  { model: "BERT-Large", exhibitId: "evt_2018_bert" },
  { model: "GPT-2 (1.5B)", exhibitId: "evt_2019_gpt2" },
  { model: "GPT-3 175B (davinci)", exhibitId: "evt_2020_gpt3" },
  { model: "DALL-E" },
  { model: "Chinchilla", exhibitId: "evt_2022_chinchilla" },
  { model: "GPT-4 (Mar 2023)", exhibitId: "evt_2023_gpt4" },
  { model: "Llama 2-70B" },
  { model: "DeepSeek-R1", exhibitId: "evt_2025_deepseek_r1" },
];

/**
 * Recognisable recent models the score cannot be trusted to keep: the newest have no citations yet
 * and crowd one corner of the plot. Spelled exactly as Epoch spells them; mapping.test.ts checks.
 */
export const EXTRA_PINS: readonly string[] = [
  "Gemini 1.0 Ultra",
  "Claude 3.5 Sonnet",
  "Llama 3.1-405B",
  "GPT-4.5",
  "GPT-5",
  "Grok 4",
];

/** Models always shown: every landmark, plus the extra pins. Edit this list to change the default view. */
export const PINS: readonly string[] = [...LANDMARKS.map((landmark) => landmark.model), ...EXTRA_PINS];

/**
 * Models never shown by default, whatever their score. Each needs a reason a visitor would accept.
 * Spelled exactly as Epoch spells them; mapping.test.ts checks they still exist.
 */
export const EXCLUDES: readonly string[] = [
  // A speed-up of GPT-2 Medium from a later paper, so the name misleads.
  "GPT-2 Medium (FlashAttention)",
  // Epoch's label for a vague early row; not a model a visitor would recognise.
  "Image generation",
];

export function landmarkForExhibit(exhibitId: string): Landmark | undefined {
  return LANDMARKS.find((landmark) => landmark.exhibitId === exhibitId);
}
