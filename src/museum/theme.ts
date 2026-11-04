// The night + gold palette. Keep in step with the --bp-* tokens in app/globals.css
// (theme.test.ts fails if they drift). The 3D scene reads these; the CSS reads the tokens.
// "redline" is gold: the single "where you are" accent.
export const PALETTE = {
  prussian: "#07070D",
  lift: "#0C0D17",
  chalk: "#E8E6F0",
  "chalk-dim": "#8B8AA3",
  redline: "#D4AF37",
  print: "#0C0D17",
  ink: "#E8E6F0",
  "gold-soft": "#F0D68A",
  cyan: "#5EEAD4",
} as const;

export const PRUSSIAN = PALETTE.prussian;
export const LIFT = PALETTE.lift;
export const CHALK = PALETTE.chalk;
export const CHALK_DIM = PALETTE["chalk-dim"];
export const REDLINE = PALETTE.redline;
export const PRINT = PALETTE.print;
export const INK = PALETTE.ink;

// A shape per confidence word, so a badge never relies on colour alone.
export const CONFIDENCE_GLYPH = {
  confirmed: "●",
  reported: "◐",
  rumored: "○",
  disputed: "◆",
  unset: "–",
} as const;
