"use client";

import { useEffect, useMemo, useRef } from "react";
import { BoxGeometry, type BufferGeometry, CylinderGeometry, type Group } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
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

type ColumnGeometry = { discs: BufferGeometry; metal: BufferGeometry };

// All columns at the given points merged into two geometries (discs, and axes plus digit ticks),
// so the mill costs two draw calls and one outline instead of one per disc.
function columnGeometry(points: { x: number; z: number }[]): ColumnGeometry {
  const discs: BufferGeometry[] = [];
  const metal: BufferGeometry[] = [];
  for (const { x, z } of points) {
    metal.push(new CylinderGeometry(0.005, 0.005, TOP_Y - PLATE_Y, 6).translate(x, (PLATE_Y + TOP_Y) / 2, z));
    for (let i = 0; i < DISCS; i++) {
      const y = PLATE_Y + 0.05 + i * DISC_GAP;
      const turn = (i * 7 * DIGIT) % (Math.PI * 2);
      discs.push(new CylinderGeometry(0.032, 0.032, 0.01, 12).translate(x, y, z));
      metal.push(new BoxGeometry(0.012, 0.012, 0.006).translate(0.03, 0, 0).rotateY(turn).translate(x, y, z));
    }
  }
  const merged = { discs: mergeGeometries(discs), metal: mergeGeometries(metal) };
  [...discs, ...metal].forEach((part) => part.dispose());
  return merged;
}

function useColumns(points: { x: number; z: number }[]): ColumnGeometry {
  // points are module constants, so the merge runs once per mount.
  const geometry = useMemo(() => columnGeometry(points), [points]);
  useEffect(() => () => {
    geometry.discs.dispose();
    geometry.metal.dispose();
  }, [geometry]);
  return geometry;
}

function Columns({ geometry, accent }: { geometry: ColumnGeometry; accent: boolean }) {
  return (
    <>
      <mesh geometry={geometry.discs}>
        <Ink tone="stone" accent={accent} />
      </mesh>
      <mesh geometry={geometry.metal}>
        <Ink tone="metal" />
      </mesh>
    </>
  );
}

const STATIC_POINTS = COLUMNS_X.flatMap((x) => ROWS_Z.map((z) => ({ x, z }))).filter(
  (point) => !(point.x === TURNING.x && point.z === TURNING.z),
);
const TURNING_POINT = [{ x: 0, z: 0 }];

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
  const fixed = useColumns(STATIC_POINTS);
  const turningColumn = useColumns(TURNING_POINT);
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
        <Columns geometry={fixed} accent={mill} />
      </group>
      <group name="column" ref={turning} position={[TURNING.x, 0, TURNING.z]}>
        <Columns geometry={turningColumn} accent={mill || highlight === "column"} />
      </group>
    </group>
  );
}
