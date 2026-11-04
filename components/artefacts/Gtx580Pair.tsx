"use client";

import { useRef } from "react";
import type { Mesh } from "three";
import { CHALK, CHALK_DIM, REDLINE } from "../../src/museum/theme";
import { Ink } from "../Ink";
import { useActiveFrame, type ArtefactProps } from "./motion";

// After the CC0 photo of a bare GTX 580 board (cooler off): the GF110 package left of centre,
// twelve memory chips around it (five above, three left, four right), the PCIe fingers along
// the bottom edge, the display bracket at the left end and two power sockets top right.
// Board 267 × 111 mm, drawn at 1.6×. AlexNet trained on two of them.
const L = 0.267 * 1.6;
const H = 0.111 * 1.6;
const DIE: [number, number] = [-0.05, 0.0];
const MEMORY: [number, number][] = [
  ...[-0.13, -0.085, -0.04, 0.005, 0.05].map((x): [number, number] => [x, 0.06]),
  ...[0.03, -0.0, -0.03].map((y): [number, number] => [-0.15, y]),
  ...[0.035, 0.01, -0.015, -0.04].map((y): [number, number] => [0.05, y]),
];
const TILT = -0.45;
const PULSE_SECONDS = 0.6;

function Board({ x, highlight, dieRef }: { x: number; highlight?: string; dieRef: (mesh: Mesh | null) => void }) {
  return (
    <group position={[x, 0.16, 0]} rotation={[TILT, 0, 0]}>
      <mesh>
        <boxGeometry args={[L, H, 0.006]} />
        <Ink tone="stone" accent={highlight === "boards"} />
      </mesh>
      <group position={[0, 0, 0.004]}>
        <mesh name="die" position={[DIE[0], DIE[1], 0]}>
          <boxGeometry args={[0.07, 0.07, 0.006]} />
          <Ink tone="stone" accent={highlight === "die"} />
        </mesh>
        <mesh ref={dieRef} position={[DIE[0], DIE[1], 0.0035]} visible={false}>
          <planeGeometry args={[0.05, 0.05]} />
          <meshBasicMaterial color={REDLINE} />
        </mesh>
        <group name="memory">
          {MEMORY.map(([mx, my]) => (
            <mesh key={`${mx}${my}`} position={[mx, my, 0]}>
              <boxGeometry args={[0.028, 0.02, 0.004]} />
              <Ink tone="stone" accent={highlight === "memory"} />
            </mesh>
          ))}
        </group>
        {[0.14, 0.175].map((px) => (
          <mesh key={px} position={[px, H / 2 - 0.02, 0.006]}>
            <boxGeometry args={[0.03, 0.025, 0.014]} />
            <Ink tone="stone" />
          </mesh>
        ))}
      </group>
      <mesh position={[-0.06, -H / 2 - 0.006, 0]}>
        <boxGeometry args={[0.18, 0.012, 0.003]} />
        <meshBasicMaterial color={CHALK_DIM} />
      </mesh>
      <mesh position={[-L / 2 - 0.004, 0.0, 0.01]}>
        <boxGeometry args={[0.006, H + 0.02, 0.03]} />
        <Ink tone="metal" />
      </mesh>
      {[0.04, -0.03].map((y) => (
        <mesh key={y} position={[-L / 2 + 0.02, y, 0.012]}>
          <boxGeometry args={[0.03, 0.04, 0.018]} />
          <meshBasicMaterial color={CHALK} />
        </mesh>
      ))}
    </group>
  );
}

export function Gtx580Pair({ active, highlight }: ArtefactProps) {
  const dies = useRef<(Mesh | null)[]>([null, null]);
  const show = (which: number) => {
    dies.current.forEach((die, i) => {
      if (die) die.visible = i === which;
    });
  };
  useActiveFrame(active, (t) => show(Math.floor(t / PULSE_SECONDS) % 2), () => show(-1));
  return (
    <group name="boards">
      {[-0.23, 0.23].map((x, i) => (
        <Board
          key={x}
          x={x}
          highlight={highlight}
          dieRef={(mesh) => {
            dies.current[i] = mesh;
          }}
        />
      ))}
      {[-0.23, 0.23].map((x) => (
        <mesh key={x} position={[x, 0.05, 0.07]}>
          <boxGeometry args={[0.3, 0.1, 0.04]} />
          <Ink tone="stone" />
        </mesh>
      ))}
    </group>
  );
}
