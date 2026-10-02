import type { ProseFlag } from "./types";

const LICENSED = [
  "policy gradient",
  "exploration policy",
  "inductive bias",
  "bias-variance",
  "statistical bias",
  "selection bias",
  "dataset bias",
  "computational cost",
  "training cost",
  "inference cost",
  "linear discriminant",
  "discriminant analysis",
];

const BANNED = [
  "job loss",
  "job displacement",
  "labor market",
  "unemployment",
  "regulation",
  "legislation",
  "ai act",
  "governance",
  "military",
  "weapon",
  "warfare",
  "stock price",
  "market cap",
  "racial bias",
  "gender bias",
  "consciousness",
  "sentience",
  "science fiction",
  "philosophy of mind",
];

const AMBIGUOUS = ["bias", "policy"];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mask(text: string, phrases: string[]): string {
  let masked = text;
  for (const phrase of phrases) {
    masked = masked.replace(new RegExp(escapeRegExp(phrase), "gi"), (match) => " ".repeat(match.length));
  }
  return masked;
}

export function lintProse(text: string): ProseFlag[] {
  const flags: ProseFlag[] = [];
  const licensedMasked = mask(text, LICENSED);
  let bannedMasked = licensedMasked;
  for (const phrase of BANNED) {
    const found = bannedMasked.match(new RegExp(escapeRegExp(phrase), "i"));
    if (!found) continue;
    flags.push({ rule: "out-of-scope-prose", match: phrase });
    bannedMasked = mask(bannedMasked, [phrase]);
  }
  for (const word of AMBIGUOUS) {
    if (new RegExp(`\\b${word}\\b`, "i").test(bannedMasked)) {
      flags.push({ rule: "out-of-scope-prose", match: word });
    }
  }
  return flags;
}
