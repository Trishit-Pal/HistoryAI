"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, type LineBasicMaterial, MeshBasicMaterial } from "three";
import { CHALK, REDLINE } from "../../src/museum/theme";
import { Ink } from "../Ink";
import { ease, useActiveFrame, type ArtefactProps } from "./motion";

// After the empty 19 × 19 goban on Commons: 19 lines each way and nine star points. No stone is
// placed: the sources name Move 37 but give no point for it. The board leans on a back block
// so the grid faces the room.
const LINES = 19;
const PITCH = 0.03;
const HALF = ((LINES - 1) * PITCH) / 2;
const TOP = 0.1;
const DEPTH = 0.64;
const STAR = [3, 9, 15];
const TILT = 0.35;
const LIFT = (DEPTH / 2) * Math.sin(TILT);
const BACK_Y = 2 * LIFT;
const LIGHT_SECONDS = 0.8;

const at = (i: number) => -HALF + i * PITCH;
const chalk = new Color(CHALK);
const gold = new Color(REDLINE);

function gridLines(): BufferGeometry {
  const points: number[] = [];
  for (let i = 0; i < LINES; i++) {
    points.push(at(i), 0, -HALF, at(i), 0, HALF);
    points.push(-HALF, 0, at(i), HALF, 0, at(i));
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return geometry;
}

export function GoBoard({ active, highlight }: ArtefactProps) {
  const grid = useMemo(gridLines, []);
  const lines = useRef<LineBasicMaterial>(null);
  const stars = useMemo(() => new MeshBasicMaterial({ color: CHALK }), []);
  useEffect(() => () => stars.dispose(), [stars]);
  const hot = highlight === "grid";
  const paint = (k: number) => {
    lines.current?.color.copy(chalk).lerp(gold, hot ? 1 : k);
    stars.color.copy(hot || k >= 1 ? gold : chalk);
  };
  useLayoutEffect(() => paint(0));
  useActiveFrame(active, (t) => paint(ease(t, LIGHT_SECONDS)), () => paint(0));
  return (
    <group>
      <mesh position={[0, BACK_Y / 2, -(DEPTH / 2) * Math.cos(TILT) + 0.02]}>
        <boxGeometry args={[0.5, BACK_Y, 0.04]} />
        <Ink tone="stone" />
      </mesh>
      <group rotation={[TILT, 0, 0]} position={[0, LIFT, 0]}>
        <mesh position={[0, TOP / 2, 0]}>
          <boxGeometry args={[0.6, TOP, DEPTH]} />
          <Ink tone="stone" />
        </mesh>
        <group name="grid" position={[0, TOP + 0.001, 0]}>
          <lineSegments geometry={grid} raycast={() => null}>
            <lineBasicMaterial ref={lines} color={CHALK} />
          </lineSegments>
          {STAR.flatMap((col) =>
            STAR.map((row) => (
              <mesh key={`${col}${row}`} position={[at(col), 0.001, at(row)]} rotation={[-Math.PI / 2, 0, 0]} material={stars}>
                <circleGeometry args={[0.006, 10]} />
              </mesh>
            )),
          )}
        </group>
      </group>
    </group>
  );
}
