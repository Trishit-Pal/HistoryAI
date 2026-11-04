"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, type InstancedMesh, Object3D } from "three";
import { CHALK, CHALK_DIM, REDLINE } from "../../src/museum/theme";
import { Ink } from "../Ink";
import { useActiveFrame, type ArtefactProps } from "./motion";

// After Pokiiri's photo of a GB200 NVL72 rack, top to bottom: an open cable space, two network
// switches in one housing, four power shelves of six modules, then one housing holding ten
// trays, nine trays with a row of ports at the left, and eight trays, then an empty base. Width to
// height and every height are read off the photo; the photo shows no depth, so D is a guess.
const W = 0.24;
const H = 0.88;
const D = 0.43;
const FRONT = D / 2;
const TRAY_W = 0.163;
const TRAY_TOP = 0.29;
const TRAY_PITCH = ((0.818 - TRAY_TOP) * H) / 27;
type TrayKind = "bays" | "ported";
const TRAYS: TrayKind[] = [...Array<TrayKind>(10).fill("bays"), ...Array<TrayKind>(9).fill("ported"), ...Array<TrayKind>(8).fill("bays")];
const SWEEP_SECONDS = 1.6;
const LIT = new Color(REDLINE);
const DIM = new Color(CHALK_DIM);

// y of a fraction measured down from the top of the rack, as in the photo.
const down = (t: number) => H * (1 - t);
const trayY = (i: number) => down(TRAY_TOP) - (i + 0.5) * TRAY_PITCH;

function rect(points: number[], x: number, y: number, w: number, h: number) {
  const [l, r, b, t] = [x - w / 2, x + w / 2, y - h / 2, y + h / 2];
  points.push(l, b, 0, r, b, 0, r, b, 0, r, t, 0, r, t, 0, l, t, 0, l, t, 0, l, b, 0);
}

function lines(build: (points: number[]) => void): BufferGeometry {
  const points: number[] = [];
  build(points);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return geometry;
}

// Each kind of tray as one merged line drawing, as in the photo: three bays, or a row of ports
// at the left. The source names no tray, so the "trays" hotspot lights all of them.
function trayLines(kind: TrayKind): BufferGeometry {
  return lines((points) => {
    TRAYS.forEach((k, i) => {
      if (k !== kind) return;
      const y = trayY(i);
      const h = TRAY_PITCH * 0.82;
      rect(points, 0, y, TRAY_W, h);
      if (kind === "bays") {
        for (const x of [-0.028, 0.03]) points.push(x, y - h / 2, 0, x, y + h / 2, 0);
      } else {
        for (let p = 0; p < 6; p++) rect(points, -0.06 + p * 0.011, y, 0.007, h * 0.45);
      }
    });
  });
}

// The two network switches and the four power shelves of six modules.
function upperLines(): BufferGeometry {
  return lines((points) => {
    for (const t of [0.128, 0.162]) rect(points, 0, down(t), TRAY_W, 0.026);
    for (let row = 0; row < 4; row++) {
      for (let m = 0; m < 6; m++) rect(points, -0.075 + m * 0.03, down(0.2 + row * 0.02), 0.026, 0.0155);
    }
  });
}

function StatusLights({ active }: { active: boolean }) {
  const lights = useRef<InstancedMesh>(null);
  const painted = useRef(-2);
  // One light per tray sweeps down once, then all rest dim.
  const paint = (lit: number) => {
    const mesh = lights.current;
    if (!mesh || lit === painted.current) return;
    painted.current = lit;
    for (let i = 0; i < TRAYS.length; i++) mesh.setColorAt(i, i === lit ? LIT : DIM);
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };
  useLayoutEffect(() => {
    const mesh = lights.current;
    if (!mesh) return;
    const dummy = new Object3D();
    TRAYS.forEach((_, i) => {
      dummy.position.set(TRAY_W / 2 - 0.008, trayY(i), 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    painted.current = -2;
    paint(-1);
  }, []);
  useActiveFrame(active, (t) => paint(t < SWEEP_SECONDS ? Math.floor((t / SWEEP_SECONDS) * TRAYS.length) : -1), () => paint(-1));
  return (
    <instancedMesh ref={lights} args={[undefined, undefined, TRAYS.length]} position={[0, 0, FRONT + 0.009]} raycast={() => null}>
      <planeGeometry args={[0.006, TRAY_PITCH * 0.4]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  );
}

export function Gb200Rack({ active, highlight }: ArtefactProps) {
  const bays = useMemo(() => trayLines("bays"), []);
  const ported = useMemo(() => trayLines("ported"), []);
  const upper = useMemo(upperLines, []);
  const housingTop = down(0.275);
  const housingBottom = down(0.826);
  return (
    <group>
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
        <Ink tone="stone" />
      </mesh>
      <mesh position={[0, down(0.145), FRONT + 0.003]}>
        <boxGeometry args={[0.182, 0.075, 0.006]} />
        <Ink tone="stone" />
      </mesh>
      <mesh name="domain" position={[0, (housingTop + housingBottom) / 2, FRONT + 0.003]}>
        <boxGeometry args={[0.182, housingTop - housingBottom, 0.006]} />
        <Ink tone="stone" accent={highlight === "domain"} />
      </mesh>
      <group position={[0, 0, FRONT + 0.007]}>
        <lineSegments geometry={upper} raycast={() => null}>
          <lineBasicMaterial color={CHALK_DIM} />
        </lineSegments>
        <group name="trays">
          {[bays, ported].map((geometry) => (
            <lineSegments key={geometry.uuid} geometry={geometry} raycast={() => null}>
              <lineBasicMaterial color={highlight === "trays" ? REDLINE : CHALK} />
            </lineSegments>
          ))}
        </group>
      </group>
      <StatusLights active={active} />
    </group>
  );
}
