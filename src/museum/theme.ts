// The cyanotype palette. Keep in step with the --bp-* tokens in app/globals.css
// (theme.test.ts fails if they drift). The 3D scene reads these; the CSS reads the tokens.
export const PALETTE = {
  prussian: "#0E2A47",
  lift: "#16406A",
  chalk: "#EAF1F5",
  "chalk-dim": "#8FAEC6",
  redline: "#FF7A59",
  print: "#F2F6F8",
  ink: "#1E2430",
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
