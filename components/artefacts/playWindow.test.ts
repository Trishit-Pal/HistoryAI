import { describe, expect, it } from "vitest";
import { advancePlay, IDLE, PLAY_SECONDS, type PlayState } from "./playWindow";

describe("advancePlay", () => {
  it("steps from the moment it becomes active", () => {
    const a = advancePlay(IDLE, true, 10);
    expect(a.action).toEqual({ kind: "step", seconds: 0 });
    expect(advancePlay(a.state, true, 11.5).action).toEqual({ kind: "step", seconds: 1.5 });
  });

  it("rests once when the window ends, then stays still while active", () => {
    let s: PlayState = advancePlay(IDLE, true, 0).state;
    const end = advancePlay(s, true, PLAY_SECONDS);
    expect(end.action).toEqual({ kind: "rest" });
    s = end.state;
    expect(advancePlay(s, true, PLAY_SECONDS + 1).action).toEqual({ kind: "none" });
    expect(advancePlay(s, true, 100).action).toEqual({ kind: "none" });
  });

  it("restarts the window only on a false -> true transition", () => {
    const rested = advancePlay(advancePlay(IDLE, true, 0).state, true, 5).state;
    const off = advancePlay(rested, false, 6);
    expect(off.action).toEqual({ kind: "none" });
    expect(advancePlay(off.state, true, 7).action).toEqual({ kind: "step", seconds: 0 });
  });

  it("rests once if deactivated mid-window, never if it never started", () => {
    const mid = advancePlay(IDLE, true, 0).state;
    const off = advancePlay(mid, false, 1);
    expect(off.action).toEqual({ kind: "rest" });
    expect(advancePlay(off.state, false, 2).action).toEqual({ kind: "none" });
    expect(advancePlay(IDLE, false, 0).action).toEqual({ kind: "none" });
  });
});
