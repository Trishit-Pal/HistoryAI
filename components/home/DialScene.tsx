"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, useCursor } from "@react-three/drei";
import { Box3, type Group, MathUtils, type Material, Matrix4, type Mesh, Vector3 } from "three";
import type { DialEntry } from "../../src/museum/dial";
import { PRUSSIAN, REDLINE } from "../../src/museum/theme";
import { ARTEFACT_MODELS } from "../artefacts/PlinthArtefact";
import { Ink } from "../Ink";

// A slow-reading shelf: the artefacts stand on short plinths round one thin gold ring, and the
// ring turns so the chosen one faces the viewer. Motion only answers the dial (DESIGN.md).
const RADIUS = 1.9;
const PLINTH_H = 0.07;
const PLINTH_R = 0.56;
// Every artefact is fitted to this largest dimension (metres) on the shelf.
const FIT = 0.95;
// ~1 s to settle: e^(-DAMP · 1 s) ≈ 1.5% left.
const DAMP = 4.2;
// The page-load entrance starts the ring this far round and eases it into place once.
const ENTRANCE = 0.55;
const LOOK: [number, number, number] = [0, 0.5, RADIUS];
// Fog in the ground colour dims the artefacts away from the front, like faint lines on a plan.
const FOG: [string, number, number] = [PRUSSIAN, 3.2, 4.7];

type SceneProps = {
  entries: DialEntry[];
  index: number;
  reduced: boolean;
  onSelect: (index: number) => void;
  onVisit: (index: number) => void;
};

// The model's bounds in its own frame (Box3.setFromObject would include the ring's turn).
function localBox(group: Group): Box3 {
  group.updateWorldMatrix(true, true);
  const toLocal = group.matrixWorld.clone().invert();
  const box = new Box3();
  const part = new Box3();
  const matrix = new Matrix4();
  group.traverse((object) => {
    const geometry = (object as Mesh).geometry;
    if (!geometry) return;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    if (geometry.boundingBox && !geometry.boundingBox.isEmpty()) {
      box.union(part.copy(geometry.boundingBox).applyMatrix4(matrix.multiplyMatrices(toLocal, object.matrixWorld)));
    }
  });
  return box;
}

function Stop({ entry, angle, front, onPick }: { entry: DialEntry; angle: number; front: boolean; onPick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const inner = useRef<Group>(null);
  useCursor(hovered);
  const Model = ARTEFACT_MODELS[entry.artefact.component];

  // Measured once at scale 1, then fitted to one display size and centred on its plinth,
  // so a relay and a pair of cabinets read at the same size on the shelf.
  useLayoutEffect(() => {
    const group = inner.current;
    if (!group) return;
    const box = localBox(group);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const fit = FIT / Math.max(size.x, size.y, size.z, 0.1);
    group.scale.setScalar(fit);
    group.position.set(-centre.x * fit, PLINTH_H, -centre.z * fit);
  }, []);

  return (
    <group
      position={[RADIUS * Math.sin(angle), 0, RADIUS * Math.cos(angle)]}
      rotation={[0, angle, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onPick();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, PLINTH_H / 2, 0]}>
        <cylinderGeometry args={[PLINTH_R, PLINTH_R * 1.04, PLINTH_H, 40]} />
        <Ink tone="stone" accent={hovered && !front} />
      </mesh>
      <group ref={inner}>
        <Model active={front} />
      </group>
    </group>
  );
}

function Shelf({ entries, index, reduced, onSelect, onVisit }: SceneProps) {
  const ring = useRef<Group>(null);
  const step = (Math.PI * 2) / entries.length;
  // Monotonic, never wrapped: moving the dial right always turns the shelf the same way.
  const target = -index * step;
  const entered = useRef(false);
  const circle = useMemo(
    () => Array.from({ length: 129 }, (_, i) => [RADIUS * Math.sin((i / 128) * Math.PI * 2), 0.002, RADIUS * Math.cos((i / 128) * Math.PI * 2)] as [number, number, number]),
    [],
  );

  // drei's fat lines (the ring, the protein trace) are ShaderMaterials, which ignore fog unless asked.
  useLayoutEffect(() => {
    ring.current?.traverse((object) => {
      const material = (object as Mesh).material as (Material & { fog?: boolean }) | undefined;
      if (material && !material.fog) {
        material.fog = true;
        material.needsUpdate = true;
      }
    });
  }, []);

  useFrame((_, delta) => {
    const group = ring.current;
    if (!group) return;
    if (!entered.current) {
      entered.current = true;
      group.rotation.y = reduced ? target : target + ENTRANCE;
    }
    group.rotation.y = reduced ? target : MathUtils.damp(group.rotation.y, target, DAMP, Math.min(delta, 0.1));
  });

  return (
    <group ref={ring}>
      <Line points={circle} color={REDLINE} lineWidth={1} transparent opacity={0.4} />
      {entries.map((entry, i) => (
        <Stop
          key={entry.id}
          entry={entry}
          angle={i * step}
          front={i === index}
          onPick={() => (i === index ? onVisit(i) : onSelect(i))}
        />
      ))}
    </group>
  );
}

export function DialScene(props: SceneProps) {
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      camera={{ fov: 30, position: [0, 1.25, RADIUS + 3.1], near: 0.05, far: 30 }}
      onCreated={({ camera }) => camera.lookAt(...LOOK)}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[PRUSSIAN]} />
      <fog attach="fog" args={FOG} />
      <Shelf {...props} />
    </Canvas>
  );
}
