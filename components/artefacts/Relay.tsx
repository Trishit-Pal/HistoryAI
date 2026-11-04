"use client";

import { useRef } from "react";
import type { Group } from "three";
import { Ink } from "../Ink";
import { useActiveFrame, type ArtefactProps } from "./motion";

// After the "Relay principle" drawing: coil (1) on a base, an L-shaped armature (2) hinged above
// it, and a push rod that bends the middle of three contact springs (3).
const COIL_X = -0.1;
const COIL_H = 0.2;
const PIVOT: [number, number, number] = [0.05, 0.27, 0];
const SPRINGS_X = [0.1, 0.15, 0.2];
const TICK_PERIOD = 0.9;
const PULL = 0.12;

export function Relay({ active, highlight }: ArtefactProps) {
  const armature = useRef<Group>(null);
  const spring = useRef<Group>(null);
  const set = (closed: boolean) => {
    if (armature.current) armature.current.rotation.z = closed ? PULL : 0;
    if (spring.current) spring.current.rotation.z = closed ? -0.16 : 0;
  };
  useActiveFrame(active, (t) => set(Math.floor(t / TICK_PERIOD) % 2 === 0), () => set(false));
  return (
    <group>
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.42, 0.024, 0.16]} />
        <Ink tone="stone" />
      </mesh>
      <group name="coil" position={[COIL_X, 0.024, 0]}>
        <mesh position={[0, COIL_H / 2, 0]}>
          <cylinderGeometry args={[0.055, 0.055, COIL_H - 0.03, 20]} />
          <Ink tone="stone" accent={highlight === "coil"} />
        </mesh>
        {[0.008, COIL_H - 0.008].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.068, 0.068, 0.016, 20]} />
            <Ink tone="stone" accent={highlight === "coil"} />
          </mesh>
        ))}
        <mesh position={[0, COIL_H + 0.01, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 14]} />
          <Ink tone="metal" />
        </mesh>
      </group>
      <group name="armature" ref={armature} position={PIVOT}>
        <mesh position={[-0.08, 0.018, 0]}>
          <boxGeometry args={[0.2, 0.036, 0.07]} />
          <Ink tone="stone" accent={highlight === "armature"} />
        </mesh>
        <mesh position={[0.0, -0.06, 0]}>
          <boxGeometry args={[0.036, 0.16, 0.07]} />
          <Ink tone="stone" accent={highlight === "armature"} />
        </mesh>
        <mesh position={[0.05, -0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.1, 6]} />
          <Ink tone="metal" />
        </mesh>
      </group>
      {SPRINGS_X.map((x, i) => {
        const moving = i === 1;
        return (
          <group key={x} name={moving ? "contact" : undefined} ref={moving ? spring : undefined} position={[x, 0.024, 0]}>
            <mesh position={[0, 0.13, 0]}>
              <boxGeometry args={[0.012, 0.26, 0.03]} />
              <Ink tone="stone" accent={moving && highlight === "contact"} />
            </mesh>
            <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.04, 10]} />
              <Ink tone="metal" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
