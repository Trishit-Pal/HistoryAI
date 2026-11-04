"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "../../src/museum/theme";

const GOLD = PALETTE.redline;
const CYAN = PALETTE.cyan;

export function stepCloud(rotation: number, reduced: boolean, yaw: number): number {
  if (reduced) return rotation;
  return rotation + 0.002 + yaw;
}

function places(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const phi = Math.acos(1 - (2 * (index + 0.5)) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * index;
    positions[index * 3] = 3.2 * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = 3.2 * Math.cos(phi);
    positions[index * 3 + 2] = 3.2 * Math.sin(phi) * Math.sin(theta);
  }
  return positions;
}

function neighbors(positions: Float32Array): Float32Array {
  const count = positions.length / 3;
  const lines: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const distances: { other: number; distance: number }[] = [];
    for (let other = 0; other < count; other += 1) {
      if (other === index) continue;
      const dx = positions[index * 3] - positions[other * 3];
      const dy = positions[index * 3 + 1] - positions[other * 3 + 1];
      const dz = positions[index * 3 + 2] - positions[other * 3 + 2];
      distances.push({ other, distance: dx * dx + dy * dy + dz * dz });
    }
    distances.sort((left, right) => left.distance - right.distance);
    for (const near of distances.slice(0, 2)) {
      lines.push(
        positions[index * 3],
        positions[index * 3 + 1],
        positions[index * 3 + 2],
        positions[near.other * 3],
        positions[near.other * 3 + 1],
        positions[near.other * 3 + 2],
      );
    }
  }
  return new Float32Array(lines);
}

function Cloud({ count, reduced }: { count: number; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const drag = useRef({ on: false, x: 0, yaw: 0 });
  const pointGeo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(places(Math.max(count, 1)), 3));
    return geometry;
  }, [count]);
  const lineGeo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = pointGeo.getAttribute("position").array as Float32Array;
    geometry.setAttribute("position", new THREE.BufferAttribute(neighbors(positions), 3));
    return geometry;
  }, [pointGeo]);

  useFrame(() => {
    const current = group.current;
    if (!current) return;
    current.rotation.y = stepCloud(current.rotation.y, reduced, drag.current.yaw);
    drag.current.yaw = reduced ? 0 : drag.current.yaw * 0.92;
  });

  return (
    <group ref={group}>
      <mesh
        onPointerDown={(event) => {
          drag.current.on = true;
          drag.current.x = event.clientX;
          (event.target as Element).setPointerCapture?.(event.pointerId);
        }}
        onPointerUp={() => {
          drag.current.on = false;
        }}
        onLostPointerCapture={() => {
          drag.current.on = false;
        }}
        onPointerMove={(event) => {
          if (!drag.current.on) return;
          drag.current.yaw = (event.clientX - drag.current.x) * 0.005;
          drag.current.x = event.clientX;
        }}
      >
        <sphereGeometry args={[6, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <points geometry={pointGeo}>
        <pointsMaterial color={GOLD} size={0.08} />
      </points>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color={CYAN} transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

export function HeroCloud({ count, reduced }: { count: number; reduced: boolean }) {
  return (
    <div className="night-hero-stage">
      <Canvas style={{ width: "100%", height: "100%" }} camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true }}>
        <color attach="background" args={[PALETTE.prussian]} />
        <Cloud count={count} reduced={reduced} />
      </Canvas>
    </div>
  );
}
