"use client";

import { Billboard, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { type MutableRefObject, useRef } from "react";
import type { Group } from "three";
import type { LandmarkView } from "../../src/atlas/landmarks";
import { instanceState, readingFor } from "../../src/atlas/projection";
import { ATLAS_PALETTE } from "../../src/atlas/theme";
import type { AtlasSnapshot } from "../../src/atlas/types";
import { LABEL_FONT } from "../labelFont";
import { type Blend, smooth } from "../../src/atlas/blend";

const LABEL_LIFT = 0.55;
// Neighbouring labels sit at one of three heights so they overlap less.
const STAGGER_STEP = 0.75;
const STAGGER_LEVELS = 3;
// Milestone names appear when the camera is this close; exhibit-linked and focused names always show.
const NEAR_LABEL_DISTANCE = 16;
// Labels grow with distance so they stay a steady size on screen instead of swamping a close view.
const SCALE_PER_DISTANCE = 1 / 32;
const MIN_LABEL_SCALE = 0.45;
const MAX_LABEL_SCALE = 1.6;
const LABEL_SIZE = 0.65;
const SHOWN_SCALE = 0.5;

interface LandmarkLabelsProps {
  atlas: AtlasSnapshot;
  /** The models to name: every featured model. */
  labels: readonly LandmarkView[];
  blend: MutableRefObject<Blend>;
  cutoff: number;
  focused: number | null;
  onFocus: (index: number) => void;
}

/** Names the well-known models. Labels ride along with their points while the scene changes metric. */
export function LandmarkLabels({ atlas, labels, blend, cutoff, focused, onFocus }: LandmarkLabelsProps) {
  const groups = useRef<Array<Group | null>>([]);
  const camera = useThree((state) => state.camera);
  const { models, domains } = atlas;

  useFrame(() => {
    const clock = blend.current;
    const mix = smooth(clock.mix);
    labels.forEach((landmark, slot) => {
      const group = groups.current[slot];
      if (!group) return;
      const state = instanceState({
        year: models.years[landmark.index],
        lane: models.domainIndex[landmark.index],
        laneCount: domains.length,
        from: readingFor(models, landmark.index, clock.from),
        to: readingFor(models, landmark.index, clock.to),
        mix,
        cutoff,
        featured: true,
        showAll: false,
      });
      const lift = LABEL_LIFT + (slot % STAGGER_LEVELS) * STAGGER_STEP;
      group.position.set(state.position[0], state.position[1] + lift, state.position[2]);
      const distance = group.position.distanceTo(camera.position);
      const always = landmark.exhibit !== undefined || landmark.index === focused;
      group.visible = state.scale > SHOWN_SCALE && (landmark.index === focused || !state.dimmed) && (always || distance < NEAR_LABEL_DISTANCE);
      group.scale.setScalar(Math.min(Math.max(distance * SCALE_PER_DISTANCE, MIN_LABEL_SCALE), MAX_LABEL_SCALE));
    });
  });

  return (
    <>
      {labels.map((landmark, slot) => (
        <Billboard
          key={landmark.model}
          ref={(group) => {
            groups.current[slot] = group;
          }}
        >
          <Text
            font={LABEL_FONT}
            fontSize={LABEL_SIZE}
            color={landmark.exhibit ? ATLAS_PALETTE["gold-soft"] : ATLAS_PALETTE.text}
            outlineWidth={0.04}
            outlineColor={ATLAS_PALETTE.ground}
            anchorX="center"
            anchorY="bottom"
            onClick={(event) => {
              // A hidden group is still hit by the raycaster; let the click through to the dot beneath.
              if (!groups.current[slot]?.visible) return;
              event.stopPropagation();
              onFocus(landmark.index);
            }}
          >
            {landmark.model}
          </Text>
        </Billboard>
      ))}
    </>
  );
}
