"use client";

import { useMemo, useRef } from "react";
import { BufferGeometry, Float32BufferAttribute, type Group } from "three";
import { CHALK, PRUSSIAN, REDLINE } from "../../src/museum/theme";
import { Ink } from "../Ink";
import { ease, useActiveFrame, type ArtefactProps } from "./motion";

// After the empty 19 × 19 goban on Commons: 19 lines each way and nine star points.
// The one stone's point is illustrative, not the Move 37 game record (the sources give no point).
const LINES = 19;
const PITCH = 0.03;
const HALF = ((LINES - 1) * PITCH) / 2;
const TOP = 0.1;
const STAR = [3, 9, 15];
const STONE_POINT = { col: 13, row: 7 };
const DROP_HEIGHT = 0.3;

const at = (i: number) => -HALF + i * PITCH;

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
  const stone = useRef<Group>(null);
  useActiveFrame(
    active,
    (t) => {
      if (stone.current) stone.current.position.y = TOP + DROP_HEIGHT * (1 - ease(t, 0.55));
    },
    () => {
      if (stone.current) stone.current.position.y = TOP;
    },
  );
  return (
    <group rotation={[0.35, 0, 0]} position={[0, 0.08, 0]}>
      <mesh position={[0, TOP / 2, 0]}>
        <boxGeometry args={[0.6, TOP, 0.64]} />
        <Ink tone="stone" />
      </mesh>
      <group name="grid" position={[0, TOP + 0.001, 0]}>
        <lineSegments geometry={grid} raycast={() => null}>
          <lineBasicMaterial color={highlight === "grid" ? REDLINE : CHALK} />
        </lineSegments>
        {STAR.flatMap((col) =>
          STAR.map((row) => (
            <mesh key={`${col}${row}`} position={[at(col), 0.001, at(row)]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.005, 10]} />
              <meshBasicMaterial color={CHALK} />
            </mesh>
          )),
        )}
      </group>
      <group name="stone" ref={stone} position={[at(STONE_POINT.col), TOP, at(STONE_POINT.row)]}>
        <mesh position={[0, 0.009, 0]} scale={[1, 0.4, 1]}>
          <sphereGeometry args={[0.0145, 16, 8]} />
          <meshBasicMaterial color={highlight === "stone" || active ? REDLINE : PRUSSIAN} />
        </mesh>
        <mesh position={[0, 0.009, 0]} scale={[1, 0.4, 1]}>
          <sphereGeometry args={[0.0155, 16, 8]} />
          <meshBasicMaterial color={CHALK} wireframe />
        </mesh>
      </group>
    </group>
  );
}
