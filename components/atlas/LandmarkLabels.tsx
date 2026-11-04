"use client";

import { Billboard, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { type MutableRefObject, useMemo, useRef } from "react";
import { type Group, Vector3 } from "three";
import type { LandmarkView } from "../../src/atlas/landmarks";
import { FIELD_OF_VIEW, instanceState, readingFor } from "../../src/atlas/projection";
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
// A name's width on screen is about this many label-heights per character (the label font is monospaced).
const CHAR_WIDTH = 0.75;
const LABEL_HEIGHT = 1.25;
const HALF_VIEW = Math.tan((FIELD_OF_VIEW * Math.PI) / 360);

interface Box {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.bottom < b.top && b.bottom < a.top;
}

/** What one frame works out for one label before overlaps are settled. Reused every frame. */
interface Candidate {
  shown: boolean;
  /** 0 is placed first and wins every overlap. */
  rank: number;
  distance: number;
  scale: number;
}

const RANKS = [0, 1, 2] as const;

interface LandmarkLabelsProps {
  atlas: AtlasSnapshot;
  /** The models to name: every featured model. */
  labels: readonly LandmarkView[];
  blend: MutableRefObject<Blend>;
  cutoff: number;
  hovered: number | null;
  focused: number | null;
  onFocus: (index: number) => void;
}

/**
 * Names the well-known models. Labels ride along with their points while the scene changes metric.
 * Where names would overlap on screen, the later one in priority order (focused or hovered, then
 * exhibit-linked, then the rest in snapshot order) is left out, so a crowd never becomes a smudge.
 */
export function LandmarkLabels({ atlas, labels, blend, cutoff, hovered, focused, onFocus }: LandmarkLabelsProps) {
  const groups = useRef<Array<Group | null>>([]);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const { models, domains } = atlas;
  const point = useMemo(() => new Vector3(), []);
  // Per-frame scratch, grown to fit and reused so drawing a frame allocates nothing.
  const candidates = useRef<Candidate[]>([]);
  const boxes = useRef<Box[]>([]);
  while (candidates.current.length < labels.length) {
    candidates.current.push({ shown: false, rank: 2, distance: 0, scale: 1 });
    boxes.current.push({ left: 0, right: 0, bottom: 0, top: 0 });
  }

  useFrame(() => {
    const clock = blend.current;
    const mix = smooth(clock.mix);
    labels.forEach((landmark, slot) => {
      const candidate = candidates.current[slot];
      const group = groups.current[slot];
      candidate.shown = false;
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
      candidate.distance = group.position.distanceTo(camera.position);
      candidate.scale = Math.min(Math.max(candidate.distance * SCALE_PER_DISTANCE, MIN_LABEL_SCALE), MAX_LABEL_SCALE);
      group.scale.setScalar(candidate.scale);
      const chosen = landmark.index === focused || landmark.index === hovered;
      candidate.rank = chosen ? 0 : landmark.exhibit ? 1 : 2;
      const always = chosen || landmark.exhibit !== undefined;
      candidate.shown =
        state.scale > SHOWN_SCALE && (chosen || !state.dimmed) && (always || candidate.distance < NEAR_LABEL_DISTANCE);
    });

    let placed = 0;
    for (const level of RANKS) {
      labels.forEach((landmark, slot) => {
        const candidate = candidates.current[slot];
        const group = groups.current[slot];
        if (!group || !candidate.shown || candidate.rank !== level) return;
        point.copy(group.position).project(camera);
        // Behind the camera, or past the far plane: nothing to see, and it must not hide a label that is.
        if (point.z > 1) {
          candidate.shown = false;
          return;
        }
        // The label's rectangle in screen pixels, from its bottom-centre anchor.
        const pixelsPerUnit = size.height / (2 * HALF_VIEW * candidate.distance);
        const width = landmark.model.length * CHAR_WIDTH * LABEL_SIZE * candidate.scale * pixelsPerUnit;
        const centreX = (point.x * size.width) / 2;
        const baseY = (point.y * size.height) / 2;
        const box = boxes.current[placed];
        box.left = centreX - width / 2;
        box.right = centreX + width / 2;
        box.bottom = baseY;
        box.top = baseY + LABEL_HEIGHT * LABEL_SIZE * candidate.scale * pixelsPerUnit;
        // The focused and hovered names are always drawn, whatever they overlap.
        let clear = true;
        for (let other = 0; level > 0 && other < placed && clear; other += 1) clear = !overlaps(box, boxes.current[other]);
        if (clear) placed += 1;
        else candidate.shown = false;
      });
    }
    labels.forEach((_, slot) => {
      const group = groups.current[slot];
      if (group) group.visible = candidates.current[slot].shown;
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
