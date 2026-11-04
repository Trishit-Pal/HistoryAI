"use client";

import { useRef } from "react";
import { Text } from "@react-three/drei";
import { Color, type Mesh, type MeshBasicMaterial } from "three";
import { CHALK, CHALK_DIM, REDLINE } from "../../src/museum/theme";
import { Ink } from "../Ink";
import { LABEL_FONT } from "../labelFont";
import { useActiveFrame, type ArtefactProps } from "./motion";

// After the Computer History Museum photo of an RS/6000 SP tower: a tall black cabinet with
// split front doors and a row of short door-light slots down each door. Deep Blue was two of
// them; its chess chips are inside the cabinets, so the "chips" hotspot marks the cabinets.
const W = 0.26;
const H = 0.66;
const D = 0.28;
const ROWS = 7;
const TOWERS_X = [-0.15, 0.15];
const SCAN_PERIOD = 0.12;
const LIT = new Color(REDLINE);
const DIM = new Color(CHALK_DIM);

export function DeepBlue({ active, highlight }: ArtefactProps) {
  const slots = useRef<(Mesh | null)[]>([]);
  const light = (lit: number) => {
    slots.current.forEach((slot, i) => {
      if (slot) (slot.material as MeshBasicMaterial).color.copy(i === lit ? LIT : DIM);
    });
  };
  const total = TOWERS_X.length * 2 * ROWS;
  useActiveFrame(active, (t) => light(Math.floor(t / SCAN_PERIOD) % total), () => light(-1));
  return (
    <group>
      {TOWERS_X.map((x, tower) => (
        <group key={x} name={tower === 0 ? "cabinets" : undefined} position={[x, 0, 0]}>
          <mesh position={[0, H / 2, 0]}>
            <boxGeometry args={[W, H, D]} />
            <Ink tone="stone" accent={highlight === "cabinets" || highlight === "chips"} />
          </mesh>
          <mesh position={[0, H / 2 - 0.02, D / 2 + 0.002]}>
            <boxGeometry args={[0.003, H - 0.08, 0.002]} />
            <meshBasicMaterial color={CHALK_DIM} />
          </mesh>
          <group name={tower === 0 ? "speed" : undefined} position={[0, H - 0.035, D / 2 + 0.003]}>
            <Text font={LABEL_FONT} position={[-0.07, 0, 0]} fontSize={0.022} color={highlight === "speed" ? REDLINE : CHALK} anchorX="center" anchorY="middle">
              IBM
            </Text>
            <Text font={LABEL_FONT} position={[0.065, 0, 0]} fontSize={0.016} color={highlight === "speed" ? REDLINE : CHALK} anchorX="center" anchorY="middle">
              RS/6000 SP
            </Text>
          </group>
          <group name={tower === 0 ? "doorLights" : undefined}>
            {[-1, 1].flatMap((side) =>
              Array.from({ length: ROWS }, (_, row) => {
                const index = (tower * 2 + (side + 1) / 2) * ROWS + row;
                return (
                  <mesh
                    key={`${side}${row}`}
                    ref={(mesh) => {
                      slots.current[index] = mesh;
                    }}
                    position={[side * 0.03, H - 0.11 - row * 0.075, D / 2 + 0.003]}
                  >
                    <planeGeometry args={[0.004, 0.03]} />
                    <meshBasicMaterial color={CHALK_DIM} />
                  </mesh>
                );
              }),
            )}
          </group>
        </group>
      ))}
    </group>
  );
}
