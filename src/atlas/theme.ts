// The Atlas is lit and sits in the night-home palette (#07070d ground, gold, cyan). Keep these in
// step with the --atlas-* tokens in app/atlas/atlas.css; theme.test.ts fails if they drift.
export const ATLAS_PALETTE = {
  ground: "#07070d",
  grid: "#26264a",
  gold: "#d4af37",
  "gold-soft": "#f0d68a",
  cyan: "#5eead4",
  text: "#e8e6f0",
  muted: "#8b8aa3",
  winter: "#7dd3fc",
} as const;

// One colour per domain lane. A lane is also its own row in space and carries a written label,
// so colour is never the only way to tell domains apart.
const LANE_COLOURS = ["#d4af37", "#5eead4", "#a78bfa", "#fb7185", "#7dd3fc", "#fb923c", "#e2e8f0", "#94a3b8", "#64748b"] as const;

export function laneColour(lane: number): string {
  return LANE_COLOURS[((lane % LANE_COLOURS.length) + LANE_COLOURS.length) % LANE_COLOURS.length];
}
