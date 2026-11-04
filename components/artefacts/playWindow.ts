// How long an artefact moves after it becomes active (DESIGN.md: motion answers the user, then rests).
export const PLAY_SECONDS = 4;

export type PlayState = { start: number | null; rested: boolean };
export type PlayAction = { kind: "step"; seconds: number } | { kind: "rest" } | { kind: "none" };

export const IDLE: PlayState = { start: null, rested: false };

// Pure: one frame of the play window. The timer starts on inactive -> active only, `rest` fires
// once when the window ends or the artefact stops being active, and nothing runs after that.
export function advancePlay(state: PlayState, active: boolean, now: number): { state: PlayState; action: PlayAction } {
  if (!active) {
    const needsRest = state.start !== null && !state.rested;
    return { state: IDLE, action: needsRest ? { kind: "rest" } : { kind: "none" } };
  }
  const start = state.start ?? now;
  const seconds = now - start;
  if (seconds < PLAY_SECONDS) return { state: { start, rested: false }, action: { kind: "step", seconds } };
  if (state.rested) return { state, action: { kind: "none" } };
  return { state: { start, rested: true }, action: { kind: "rest" } };
}
