"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Box3, type Group, type PerspectiveCamera, Vector3 } from "three";
import type { Artefact } from "../../src/museum/artefacts";
import { PRUSSIAN } from "../../src/museum/theme";
import { Ink } from "../Ink";
import { ARTEFACT_MODELS } from "./PlinthArtefact";

const FOV = 38;
const TURNTABLE_H = 0.02;
// Never below the turntable: stop a little above the horizon.
const MAX_POLAR = Math.PI / 2 - 0.08;
const MIN_POLAR = 0.12;
const DAMPING = 0.12;
const ELEVATION = 0.38;
// Room around the bounding sphere so the turntable's front edge stays in frame.
const FRAME_MARGIN = 1.3;

type Fit = { centre: [number, number]; lookY: number; distance: number };

// Measures the drawn model once, centres it on the turntable and frames the camera on it.
function Framed({ artefact, highlight, reduced }: { artefact: Artefact; highlight?: string; reduced: boolean }) {
  const inner = useRef<Group>(null);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const [fit, setFit] = useState<Fit | null>(null);
  const Model = ARTEFACT_MODELS[artefact.component];
  const [w, d] = artefact.footprint;
  const radius = (Math.hypot(w, d) * artefact.scale) / 2;

  useLayoutEffect(() => {
    if (!inner.current) return;
    const box = new Box3().setFromObject(inner.current);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const bound = Math.max(size.length() / 2, radius, 0.1);
    const distance = (bound / Math.sin((FOV / 2) * (Math.PI / 180))) * FRAME_MARGIN;
    const lookY = Math.max(0, box.max.y) / 2;
    camera.position.set(0, lookY + distance * Math.sin(ELEVATION), distance * Math.cos(ELEVATION));
    camera.lookAt(0, lookY, 0);
    setFit({ centre: [centre.x, centre.z], lookY, distance });
  }, [camera, radius]);

  return (
    <>
      <mesh position={[0, -TURNTABLE_H / 2, 0]}>
        <cylinderGeometry args={[radius + 0.06, radius + 0.06, TURNTABLE_H, 48]} />
        <Ink tone="stone" />
      </mesh>
      <group position={fit ? [-fit.centre[0], 0, -fit.centre[1]] : [0, 0, 0]}>
        <group ref={inner} scale={artefact.scale}>
          <Model active highlight={highlight} />
        </group>
      </group>
      {fit ? (
        <OrbitControls
          makeDefault
          target={[0, fit.lookY, 0]}
          enablePan={false}
          enableDamping={!reduced}
          dampingFactor={DAMPING}
          minDistance={fit.distance * 0.45}
          maxDistance={fit.distance * 1.8}
          minPolarAngle={MIN_POLAR}
          maxPolarAngle={MAX_POLAR}
        />
      ) : null}
    </>
  );
}

export function InspectScene({ artefact, highlight, reduced }: { artefact: Artefact; highlight?: string; reduced: boolean }) {
  return (
    <Canvas flat camera={{ fov: FOV, position: [0, 1, 3], near: 0.01, far: 50 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
      <color attach="background" args={[PRUSSIAN]} />
      <Framed artefact={artefact} highlight={highlight} reduced={reduced} />
    </Canvas>
  );
}
