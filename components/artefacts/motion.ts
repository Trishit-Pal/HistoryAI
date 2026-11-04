"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { usePrefersReducedMotion } from "../../src/museum/env";

export type ArtefactProps = { active: boolean; highlight?: string };

// One small motion that answers the user (DESIGN.md): `step` gets the seconds since the artefact
// became active; `rest` puts it back once when it stops being active. Nothing runs under reduced motion.
export function useActiveFrame(active: boolean, step: (seconds: number) => void, rest: () => void): void {
  const reduced = usePrefersReducedMotion();
  const start = useRef<number | null>(null);
  useFrame((state) => {
    if (!active || reduced) {
      if (start.current !== null) rest();
      start.current = null;
      return;
    }
    if (start.current === null) start.current = state.clock.elapsedTime;
    step(state.clock.elapsedTime - start.current);
  });
}

// 0 → 1 over `seconds`, eased, then held.
export function ease(t: number, seconds: number): number {
  const x = Math.min(1, Math.max(0, t / seconds));
  return x * x * (3 - 2 * x);
}
