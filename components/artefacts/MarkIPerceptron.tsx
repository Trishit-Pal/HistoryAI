"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, type InstancedMesh, Object3D } from "three";
import { CHALK, CHALK_DIM, PRUSSIAN, REDLINE } from "../../src/museum/theme";
import { Ink } from "../Ink";
import { useActiveFrame, type ArtefactProps } from "./motion";

// After Figure 2 of the 1960 operators' manual: camera on a tripod, then left to right the
// S-unit monitor over the manual stimulus switches, the S-to-A plugboard, the association units,
// and the response and meter panels. The monitor shows the 20 × 20 sensory units.
const GRID = 20;
const CELL = 0.0105;
const H = 0.44;
const D = 0.14;
const FRONT = D / 2 + 0.002;
const SECTIONS = { monitor: [-0.31, 0.24], plug: [-0.12, 0.14], assoc: [0.1, 0.3], response: [0.32, 0.14] } as const;
const REVEAL_SECONDS = 1.2;

// The cells of a letter C (the Navy photo shows the machine shown a "C"), in drawing order.
function letterC(): number[] {
  const cells: { index: number; angle: number }[] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const dx = col - 9.5;
      const dy = 9.5 - row;
      const r = Math.hypot(dx, dy);
      const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
      if (r > 4.6 && r < 7.8 && angle > Math.PI / 4 && angle < (Math.PI * 7) / 4) cells.push({ index: row * GRID + col, angle });
    }
  }
  return cells.sort((a, b) => a.angle - b.angle).map((cell) => cell.index);
}

function plugLines(): BufferGeometry {
  const points: number[] = [];
  for (let c = 0; c < 12; c++) {
    for (let r = 0; r < 18; r++) {
      const x = -0.06 + c * 0.011;
      const y = 0.04 + r * 0.021;
      points.push(x, y, 0, x, y + 0.012, 0);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return geometry;
}

function Retina({ active, accent }: { active: boolean; accent: boolean }) {
  const cells = useRef<InstancedMesh>(null);
  const order = useMemo(letterC, []);
  const off = useMemo(() => new Color(accent ? REDLINE : CHALK_DIM), [accent]);
  const on = useMemo(() => new Color(REDLINE), []);
  const painted = useRef(-1);
  const paint = (lit: number) => {
    const mesh = cells.current;
    if (!mesh || lit === painted.current) return;
    painted.current = lit;
    for (let i = 0; i < GRID * GRID; i++) mesh.setColorAt(i, off);
    for (let i = 0; i < lit; i++) mesh.setColorAt(order[i], on);
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };
  useLayoutEffect(() => {
    const mesh = cells.current;
    if (!mesh) return;
    const dummy = new Object3D();
    for (let i = 0; i < GRID * GRID; i++) {
      dummy.position.set(((i % GRID) - 9.5) * CELL, (9.5 - Math.floor(i / GRID)) * CELL, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    painted.current = -1;
    paint(0);
  }, [off]);
  useActiveFrame(active, (t) => paint(Math.round(order.length * Math.min(1, t / REVEAL_SECONDS))), () => paint(0));
  return (
    <instancedMesh ref={cells} args={[undefined, undefined, GRID * GRID]} raycast={() => null}>
      <planeGeometry args={[CELL * 0.7, CELL * 0.7]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  );
}

function Panel({ x, w, y, h, accent = false }: { x: number; w: number; y: number; h: number; accent?: boolean }) {
  return (
    <mesh position={[x, y, FRONT - 0.001]}>
      <boxGeometry args={[w - 0.012, h, 0.004]} />
      <Ink tone="stone" accent={accent} />
    </mesh>
  );
}

export function MarkIPerceptron({ active, highlight }: ArtefactProps) {
  const plug = useMemo(plugLines, []);
  const [mx, mw] = SECTIONS.monitor;
  const [px, pw] = SECTIONS.plug;
  const [ax, aw] = SECTIONS.assoc;
  const [rx, rw] = SECTIONS.response;
  return (
    <group position={[0.06, 0, -0.03]}>
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[0.86, H, D]} />
        <Ink tone="stone" />
      </mesh>
      <group name="retina" position={[mx, 0.315, FRONT + 0.001]}>
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[GRID * CELL + 0.01, GRID * CELL + 0.01]} />
          <meshBasicMaterial color={PRUSSIAN} />
        </mesh>
        <Retina active={active} accent={highlight === "retina"} />
      </group>
      <Panel x={mx} w={mw} y={0.1} h={0.16} />
      <group name="plugboard" position={[px, 0, FRONT + 0.001]}>
        <lineSegments geometry={plug} raycast={() => null}>
          <lineBasicMaterial color={highlight === "plugboard" ? REDLINE : CHALK} />
        </lineSegments>
      </group>
      <group name="association">
        {Array.from({ length: 8 }, (_, i) => (
          <Panel key={i} x={ax - aw / 2 + aw / 16 + (i * aw) / 8} w={aw / 8} y={0.21} h={0.38} accent={highlight === "association"} />
        ))}
      </group>
      <group name="response" position={[rx, 0, FRONT + 0.003]}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[(i % 2 ? 1 : -1) * 0.025, 0.4 - Math.floor(i / 2) * 0.03, 0]}>
            <circleGeometry args={[0.009, 12]} />
            <meshBasicMaterial color={highlight === "response" ? REDLINE : CHALK} />
          </mesh>
        ))}
        <Panel x={0} w={rw} y={0.13} h={0.2} />
      </group>
      <group position={[-0.5, 0, 0.14]}>
        {[-0.5, 0.5, 2.6].map((angle) => (
          <mesh key={angle} position={[Math.sin(angle) * 0.04, 0.1, Math.cos(angle) * 0.04]} rotation={[Math.cos(angle) * 0.35, 0, -Math.sin(angle) * 0.35]}>
            <boxGeometry args={[0.008, 0.21, 0.008]} />
            <Ink tone="metal" />
          </mesh>
        ))}
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[0.08, 0.07, 0.1]} />
          <Ink tone="stone" />
        </mesh>
        <mesh position={[0.05, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.03, 14]} />
          <Ink tone="stone" />
        </mesh>
      </group>
    </group>
  );
}
