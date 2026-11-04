"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { usePrefersReducedMotion } from "../../src/museum/env";
import { advancePlay, IDLE, type PlayState } from "./playWindow";

export type ArtefactProps = { active: boolean; highlight?: string };

// One small motion that answers the user (DESIGN.md): `step` gets the seconds since the artefact
// became active, for PLAY_SECONDS only; `rest` puts it back once when the window ends or it stops
// being active. Nothing runs under reduced motion.
export function useActiveFrame(active: boolean, step: (seconds: number) => void, rest: () => void): void {
  const reduced = usePrefersReducedMotion();
  const play = useRef<PlayState>(IDLE);
  useFrame((state) => {
    const next = advancePlay(play.current, active && !reduced, state.clock.elapsedTime);
    play.current = next.state;
    if (next.action.kind === "step") step(next.action.seconds);
    else if (next.action.kind === "rest") rest();
  });
}

// 0 → 1 over `seconds`, eased, then held.
export function ease(t: number, seconds: number): number {
  const x = Math.min(1, Math.max(0, t / seconds));
  return x * x * (3 - 2 * x);
}
