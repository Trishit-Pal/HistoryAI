"use client";

import { useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import { CatmullRomCurve3, type Group, Vector3 } from "three";
import protein from "../../src/museum/protein-6y4f.json";
import { CHALK, CHALK_DIM, REDLINE } from "../../src/museum/theme";
import { Ink } from "../Ink";
import { useActiveFrame, type ArtefactProps } from "./motion";

// The C-alpha trace of RCSB PDB 6Y4F chain A (CASP14 target T1049), from the published
// coordinates. Strands and helices (the entry's own SHEET and HELIX records) are drawn heavier.
const SCALE = 0.016;
const SMOOTH = 4;
const TURN_PER_SECOND = 0.35;
// A display rod holds the trace's centre above the slab.
const CENTRE_Y = 0.36;

type Trace = { chain: Vector3[]; segments: { kind: string; points: Vector3[] }[] };

function buildTrace(): Trace {
  const raw: Vector3[] = [];
  for (let i = 0; i < protein.ca.length; i += 3) {
    raw.push(new Vector3(protein.ca[i], protein.ca[i + 2], -protein.ca[i + 1]).multiplyScalar(SCALE));
  }
  const curve = new CatmullRomCurve3(raw, false, "centripetal");
  const chain = curve.getPoints((raw.length - 1) * SMOOTH);
  const first = protein.residues[0];
  const segments = protein.ss.map(([kind, from, to]) => {
    const a = (Number(from) - first) * SMOOTH;
    const b = (Number(to) - first) * SMOOTH;
    return { kind: String(kind), points: chain.slice(Math.max(0, a), Math.min(chain.length, b + 1)) };
  });
  return { chain, segments: segments.filter((segment) => segment.points.length > 1) };
}

export function Protein({ active, highlight }: ArtefactProps) {
  const trace = useMemo(buildTrace, []);
  const spin = useRef<Group>(null);
  useActiveFrame(
    active,
    (t) => {
      if (spin.current) spin.current.rotation.y = t * TURN_PER_SECOND;
    },
    () => {
      if (spin.current) spin.current.rotation.y = 0;
    },
  );
  const chainHot = highlight === "chain";
  return (
    <group>
      <mesh position={[0, CENTRE_Y / 2, 0]}>
        <cylinderGeometry args={[0.006, 0.006, CENTRE_Y, 6]} />
        <Ink tone="metal" />
      </mesh>
      <group ref={spin} position={[0, CENTRE_Y, 0]}>
        <Line name="chain" points={trace.chain} color={chainHot ? REDLINE : CHALK_DIM} lineWidth={1.4} />
        <group name="strands">
          {trace.segments.map((segment, i) => (
            <Line
              key={i}
              points={segment.points}
              color={chainHot || highlight === "strands" ? REDLINE : CHALK}
              lineWidth={segment.kind === "helix" ? 4 : 3}
            />
          ))}
        </group>
      </group>
    </group>
  );
}
