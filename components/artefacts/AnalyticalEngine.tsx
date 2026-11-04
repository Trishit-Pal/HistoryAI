"use client";

import { useRef } from "react";
import type { Group } from "three";
import { Ink } from "../Ink";
import { ease, useActiveFrame, type ArtefactProps } from "./motion";

// After the Science Museum's mill trial piece: a wooden box with the printing wheels at the
// front, a plate, four corner pillars and a frame holding the columns of figure wheels.
const COLUMNS_X = [-0.2, -0.12, -0.04, 0.04, 0.12, 0.2];
const ROWS_Z = [-0.06, 0.06];
const DISCS = 9;
const DISC_GAP = 0.034;
const PLATE_Y = 0.2;
const TOP_Y = 0.56;
const TURNING = { x: 0.04, z: 0.06 };
const DIGIT = (Math.PI * 2) / 10;

function Column({ x, z, accent }: { x: number; z: number; accent: boolean }) {
  return (
    <>
      <mesh position={[x, (PLATE_Y + TOP_Y) / 2, z]}>
        <cylinderGeometry args={[0.005, 0.005, TOP_Y - PLATE_Y, 6]} />
        <Ink tone="metal" />
      </mesh>
      {Array.from({ length: DISCS }, (_, i) => (
        <group key={i} position={[x, PLATE_Y + 0.05 + i * DISC_GAP, z]} rotation={[0, (i * 7 * DIGIT) % (Math.PI * 2), 0]}>
          <mesh>
            <cylinderGeometry args={[0.032, 0.032, 0.01, 12]} />
            <Ink tone="stone" accent={accent} />
          </mesh>
          <mesh position={[0.03, 0, 0]}>
            <boxGeometry args={[0.012, 0.012, 0.006]} />
            <Ink tone="metal" />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function AnalyticalEngine({ active, highlight }: ArtefactProps) {
  const turning = useRef<Group>(null);
  useActiveFrame(
    active,
    (t) => {
      if (turning.current) turning.current.rotation.y = DIGIT * ease(t, 0.9);
    },
    () => {
      if (turning.current) turning.current.rotation.y = 0;
    },
  );
  const mill = highlight === "mill";
  return (
    <group>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.6, 0.18, 0.34]} />
        <Ink tone="stone" />
      </mesh>
      <group name="printer" position={[0, 0.09, 0.2]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.7, 6]} />
          <Ink tone="metal" />
        </mesh>
        {[-0.22, -0.13, -0.04, 0.05, 0.14].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
            <Ink tone="stone" accent={highlight === "printer"} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, PLATE_Y, 0]}>
        <boxGeometry args={[0.66, 0.025, 0.4]} />
        <Ink tone="stone" accent={mill} />
      </mesh>
      {[-0.31, 0.31].flatMap((x) =>
        [-0.17, 0.17].map((z) => (
          <mesh key={`${x}${z}`} position={[x, (PLATE_Y + TOP_Y) / 2, z]}>
            <cylinderGeometry args={[0.012, 0.012, TOP_Y - PLATE_Y, 8]} />
            <Ink tone="metal" />
          </mesh>
        )),
      )}
      {[-0.17, 0.17].map((z) => (
        <mesh key={z} position={[0, TOP_Y, z]}>
          <boxGeometry args={[0.66, 0.02, 0.03]} />
          <Ink tone="stone" accent={mill} />
        </mesh>
      ))}
      {[-0.31, 0.31].map((x) => (
        <mesh key={x} position={[x, TOP_Y, 0]}>
          <boxGeometry args={[0.03, 0.02, 0.34]} />
          <Ink tone="stone" accent={mill} />
        </mesh>
      ))}
      <group name="mill">
        {COLUMNS_X.flatMap((x) =>
          ROWS_Z.map((z) =>
            x === TURNING.x && z === TURNING.z ? null : (
              <Column key={`${x}${z}`} x={x} z={z} accent={mill} />
            ),
          ),
        )}
      </group>
      <group name="column" ref={turning} position={[TURNING.x, 0, TURNING.z]}>
        <Column x={0} z={0} accent={mill || highlight === "column"} />
      </group>
    </group>
  );
}
