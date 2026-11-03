"use client";

import { useFrame } from "@react-three/fiber";
import { type MutableRefObject, useEffect, useRef } from "react";
import { type Blend, advance, retarget, steady } from "../../src/atlas/blend";
import type { AtlasMetric } from "../../src/atlas/types";

/**
 * Animation clock for switching metrics. It lives in a ref so the scene can read it every frame
 * without re-rendering React. The rules for it are in src/atlas/blend.ts, where they are tested.
 */
export function useBlend(metric: AtlasMetric, reduced: boolean): MutableRefObject<Blend> {
  const blend = useRef<Blend>(steady(metric));

  useEffect(() => {
    blend.current = retarget(blend.current, metric, reduced);
  }, [metric, reduced]);

  useFrame((_, delta) => {
    blend.current = advance(blend.current, delta);
  });

  return blend;
}
