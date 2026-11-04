"use client";

import { useCursor } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import { Color, type InstancedMesh, Object3D } from "three";
import { instanceState, readingFor } from "../../src/atlas/projection";
import { laneColour } from "../../src/atlas/theme";
import type { AtlasSnapshot } from "../../src/atlas/types";
import { type Blend, smooth } from "../../src/atlas/blend";

const POINT_RADIUS = 0.26;
const DIMMED_SIZE = 0.5;
const DIMMED_LIGHT = 0.28;
// Models shown only by "Show all": small and faint, so the featured ones stay the picture.
const MUTED_SIZE = 0.55;
const MUTED_LIGHT = 0.4;
const HOVER_GROWTH = 1.8;
const FOCUS_GROWTH = 2.4;
// A zero scale would make a singular matrix, so "hidden" is just very small.
const HIDDEN_SIZE = 0.0001;

interface PointCloudProps {
  atlas: AtlasSnapshot;
  blend: MutableRefObject<Blend>;
  cutoff: number;
  showAll: boolean;
  hovered: number | null;
  focused: number | null;
  onHover: (index: number | null) => void;
  onFocus: (index: number) => void;
}

/** Every plotted model as one instance of one mesh: a single draw call for the whole plot. */
export function PointCloud({ atlas, blend, cutoff, showAll, hovered, focused, onHover, onFocus }: PointCloudProps) {
  const mesh = useRef<InstancedMesh>(null);
  const stale = useRef(true);
  const drawnVersion = useRef(-1);
  const placer = useMemo(() => new Object3D(), []);
  const tint = useMemo(() => new Color(), []);
  const { models, domains } = atlas;

  useCursor(hovered !== null);

  useEffect(() => {
    stale.current = true;
  }, [cutoff, showAll, hovered, focused, models]);

  useEffect(() => {
    const instances = mesh.current;
    if (!instances) return;
    for (let i = 0; i < models.count; i += 1) {
      tint.set(laneColour(models.domainIndex[i]));
      if (Math.floor(models.years[i]) > cutoff) tint.multiplyScalar(DIMMED_LIGHT);
      if (!models.featured[i]) tint.multiplyScalar(MUTED_LIGHT);
      instances.setColorAt(i, tint);
    }
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true;
  }, [cutoff, models, tint]);

  useFrame(() => {
    const instances = mesh.current;
    const clock = blend.current;
    if (!instances) return;
    const retargeted = clock.version !== drawnVersion.current;
    if (clock.mix >= 1 && !stale.current && !retargeted) return;
    drawnVersion.current = clock.version;

    const mix = smooth(clock.mix);
    for (let i = 0; i < models.count; i += 1) {
      const state = instanceState({
        year: models.years[i],
        lane: models.domainIndex[i],
        laneCount: domains.length,
        from: readingFor(models, i, clock.from),
        to: readingFor(models, i, clock.to),
        mix,
        cutoff,
        featured: models.featured[i],
        showAll,
      });
      const emphasis = i === focused ? FOCUS_GROWTH : i === hovered ? HOVER_GROWTH : 1;
      const size = state.scale * (state.dimmed ? DIMMED_SIZE : 1) * (state.muted ? MUTED_SIZE : 1) * emphasis * POINT_RADIUS;
      placer.position.set(state.position[0], state.position[1], state.position[2]);
      placer.scale.setScalar(Math.max(size, HIDDEN_SIZE));
      placer.updateMatrix();
      instances.setMatrixAt(i, placer.matrix);
    }
    instances.instanceMatrix.needsUpdate = true;
    stale.current = clock.mix < 1;
  });

  const pick = (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    event.stopPropagation();
    return event.instanceId ?? null;
  };

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, models.count]}
      frustumCulled={false}
      onPointerMove={(event) => onHover(pick(event))}
      onPointerOut={() => onHover(null)}
      onClick={(event) => {
        const index = pick(event);
        if (index !== null) onFocus(index);
      }}
    >
      {/* 20 faces, not 80: about twice as fast in dev on an integrated GPU (53 to 88 ms a frame against 93 to 193, three runs each), and a dot this small reads as a round gem either way. */}
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.4} metalness={0.2} />
    </instancedMesh>
  );
}
