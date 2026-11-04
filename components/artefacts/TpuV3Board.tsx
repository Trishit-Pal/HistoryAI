"use client";

import { useMemo, useRef } from "react";
import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, type Group, Vector3 } from "three";
import { CHALK, CHALK_DIM, REDLINE } from "../../src/museum/theme";
import { Ink } from "../Ink";
import { useActiveFrame, type ArtefactProps } from "./motion";

// After Zinskauf's photo of a TPU 3.0 board, laid out from the photo (no maker's drawing): four
// chips in a 2 × 2 grid under copper cold plates in screwed frames, one coolant loop entering at
// the left and running TL → TR → BR → BL, finned heatsinks beside every chip, two large cages and
// a connector housing on the left edge, four connectors and a header on the right edge.
// Photo coordinates are scaled to a board of L × H.
const L = 0.42;
const H = 0.31;
const TILT = -1.05;
// Centre height that puts the lower edge on the slab.
const LIFT = (H / 2) * Math.cos(TILT) + 0.006;
const CHIPS: [number, number][] = [
  [-0.034, 0.068],
  [0.111, 0.068],
  [-0.034, -0.068],
  [0.111, -0.068],
];
// Heatsinks: [x, y, w, h, fins run vertical?]
const SINKS: [number, number, number, number, boolean][] = [
  ...CHIPS.flatMap(([x, y]): [number, number, number, number, boolean][] => [
    [x - 0.05, y + 0.012 * Math.sign(y), 0.018, 0.06, true],
    [x + 0.05, y - 0.012 * Math.sign(y), 0.018, 0.05, true],
  ]),
  [0.037, 0.13, 0.044, 0.03, false],
  [0.037, 0, 0.046, 0.034, false],
  [0.037, -0.13, 0.044, 0.03, false],
  [-0.115, 0, 0.045, 0.04, false],
];
const LOOP: [number, number][] = [
  [-0.22, 0.008], [-0.13, 0.016], [-0.05, 0.062], [0.01, 0.098], [0.08, 0.098], [0.112, 0.066],
  [0.125, 0.0], [0.112, -0.066], [0.06, -0.1], [0.0, -0.082], [-0.04, -0.06], [-0.11, -0.012], [-0.22, -0.012],
];
const PULSE_SECONDS = 0.9;

// Fin lines for every heatsink, merged into one draw.
function finLines(): BufferGeometry {
  const points: number[] = [];
  for (const [x, y, w, h, vertical] of SINKS) {
    const fins = Math.round((vertical ? w : h) / 0.004);
    for (let i = 0; i <= fins; i++) {
      const f = -0.5 + i / fins;
      if (vertical) points.push(x + f * w, y - h / 2, 0, x + f * w, y + h / 2, 0);
      else points.push(x - w / 2, y + f * h, 0, x + w / 2, y + f * h, 0);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return geometry;
}

export function TpuV3Board({ active, highlight }: ArtefactProps) {
  const fins = useMemo(finLines, []);
  const loop = useMemo(() => new CatmullRomCurve3(LOOP.map(([x, y]) => new Vector3(x, y, 0.016))), []);
  const glow = useRef<Group>(null);
  // The cold plates light once, as the board answers being looked at.
  const show = (lit: boolean) => {
    if (glow.current) glow.current.visible = lit;
  };
  useActiveFrame(active, (t) => show(t < PULSE_SECONDS), () => show(false));
  const chips = highlight === "chips";
  return (
    <group>
      <mesh position={[0, LIFT / 2, -0.06]}>
        <boxGeometry args={[0.3, LIFT, 0.08]} />
        <Ink tone="stone" />
      </mesh>
      <group position={[0, LIFT, 0]} rotation={[TILT, 0, 0]}>
        <mesh name="device">
          <boxGeometry args={[L, H, 0.006]} />
          <Ink tone="stone" accent={highlight === "device"} />
        </mesh>
        <group position={[0, 0, 0.003]}>
          <group name="chips">
            {CHIPS.map(([x, y]) => (
              <group key={`${x}${y}`} position={[x, y, 0]}>
                <mesh position={[0, 0, 0.004]}>
                  <boxGeometry args={[0.071, 0.118, 0.008]} />
                  <Ink tone="stone" accent={chips} />
                </mesh>
                <mesh position={[0, 0, 0.009]}>
                  <boxGeometry args={[0.059, 0.056, 0.003]} />
                  <Ink tone="stone" accent={chips} />
                </mesh>
              </group>
            ))}
          </group>
          <group ref={glow} visible={false}>
            {CHIPS.map(([x, y]) => (
              <mesh key={`${x}${y}`} position={[x, y, 0.0112]}>
                <planeGeometry args={[0.05, 0.047]} />
                <meshBasicMaterial color={REDLINE} />
              </mesh>
            ))}
          </group>
          <lineSegments geometry={fins} position={[0, 0, 0.004]} raycast={() => null}>
            <lineBasicMaterial color={CHALK_DIM} />
          </lineSegments>
          <mesh raycast={() => null}>
            <tubeGeometry args={[loop, 64, 0.0055, 6, false]} />
            <meshBasicMaterial color={CHALK_DIM} />
          </mesh>
          {[0.093, -0.088].map((y) => (
            <mesh key={y} position={[-0.16, y, 0.004]}>
              <boxGeometry args={[0.097, 0.105, 0.007]} />
              <Ink tone="stone" />
            </mesh>
          ))}
          <mesh position={[-0.18, 0, 0.006]}>
            <boxGeometry args={[0.06, 0.07, 0.012]} />
            <Ink tone="stone" />
          </mesh>
          {[0.093, 0.047, -0.062, -0.105].map((y) => (
            <mesh key={y} position={[L / 2 - 0.012, y, 0.006]}>
              <boxGeometry args={[0.026, 0.02, 0.012]} />
              <meshBasicMaterial color={CHALK} />
            </mesh>
          ))}
          <mesh position={[L / 2 - 0.01, 0, 0.005]}>
            <boxGeometry args={[0.016, 0.055, 0.01]} />
            <Ink tone="stone" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
