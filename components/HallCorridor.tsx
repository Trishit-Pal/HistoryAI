"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import gsap from "gsap";
import type { MeshStandardMaterial } from "three";
import type { Hall } from "../src/domain/layout";
import { hallThreads, otherThreadId } from "../src/domain/threads";
import { precursorsCameraY, precursorsLayout } from "../src/museum/precursorsRoom";
import { cameraMove, type MuseumNode } from "../src/museum/view";
import { Monument } from "./Monument";
import { PrecursorsRoom } from "./rooms/PrecursorsRoom";

const FLOOR = "#1A1814";
const BRASS = "#A6843D";

function hallOrigin(index: number, halls: Hall[]): number {
  let z = 0;
  for (let i = 0; i < index; i += 1) {
    const hall = halls[i];
    z -= 8 + (hall?.exhibitIds.length ?? 0) * (hall?.spacing ?? 1.8);
  }
  return z;
}

function pedestalPosition(hallIndex: number, exhibitIndex: number, halls: Hall[]): [number, number, number] {
  const hall = halls[hallIndex];
  const z0 = hallOrigin(hallIndex, halls);
  const spacing = hall?.spacing ?? 1.8;
  return [((exhibitIndex % 2) * 2 - 1) * 1.2, 0, z0 - 2 - exhibitIndex * spacing];
}

function focusedPedestal(halls: Hall[], hallIndex: number, focusedId: string | null): [number, number, number] {
  if (focusedId) {
    for (let i = 0; i < halls.length; i += 1) {
      const hall = halls[i];
      if (!hall.exhibitIds.includes(focusedId)) continue;
      const origin = hallOrigin(i, halls);
      if (hall.id === "era_0_precursors") {
        const spot = precursorsLayout(hall.exhibitIds).find((item) => item.id === focusedId);
        if (spot) return [spot.x, spot.y, origin + spot.z];
      }
      return pedestalPosition(i, hall.exhibitIds.indexOf(focusedId), halls);
    }
  }
  return [0, 0, hallOrigin(hallIndex, halls) - 2];
}

function CameraRig({
  halls,
  hallIndex,
  focusedId,
  reducedMotion,
}: {
  halls: Hall[];
  hallIndex: number;
  focusedId: string | null;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const look = focusedPedestal(halls, hallIndex, focusedId);
  const inPrecursors = Boolean(
    focusedId && halls.some((hall) => hall.id === "era_0_precursors" && hall.exhibitIds.includes(focusedId)),
  );
  const camZ = look[2] + (inPrecursors ? 4.2 : 6);
  const camY = precursorsCameraY(inPrecursors ? look[1] : null);
  useEffect(() => {
    if (cameraMove(reducedMotion) === "snap") {
      gsap.killTweensOf(camera.position);
      camera.position.set(0, camY, camZ);
      return;
    }
    const tween = gsap.to(camera.position, { x: 0, y: camY, z: camZ, duration: 1.1, ease: "power2.inOut" });
    return () => {
      tween.kill();
    };
  }, [camera, camY, camZ, reducedMotion]);
  useFrame(() => {
    camera.lookAt(look[0], 1.2 + (camY - 1.6), look[2]);
  });
  return null;
}

function FloorThread({
  from,
  to,
  fromId,
  toId,
  focusedId,
  reducedMotion,
  onFocus,
}: {
  from: [number, number, number];
  to: [number, number, number];
  fromId: string;
  toId: string;
  focusedId: string | null;
  reducedMotion: boolean;
  onFocus: (id: string) => void;
}) {
  const mat = useRef<MeshStandardMaterial>(null);
  const hot = focusedId === fromId || focusedId === toId;
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.hypot(dx, dz);
  useFrame(({ clock }) => {
    if (!mat.current) return;
    if (!hot) {
      mat.current.emissiveIntensity = 0;
      return;
    }
    if (reducedMotion) {
      mat.current.emissiveIntensity = 0.7;
      return;
    }
    const t = clock.getElapsedTime();
    mat.current.emissiveIntensity = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 3));
  });
  if (length < 0.01) return null;
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, 0.03, (from[2] + to[2]) / 2];
  const angle = Math.atan2(dx, dz);
  return (
    <group position={mid} rotation={[0, angle, 0]}>
      <mesh>
        <boxGeometry args={[0.04, 0.02, length]} />
        <meshStandardMaterial ref={mat} color={BRASS} emissive={BRASS} emissiveIntensity={0} />
      </mesh>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onFocus(otherThreadId({ fromId, toId }, focusedId));
        }}
      >
        <boxGeometry args={[0.35, 0.08, length]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function Corridor({
  halls,
  nodes,
  year,
  focusedId,
  reducedMotion,
  onFocus,
  onHall,
}: {
  halls: Hall[];
  nodes: MuseumNode[];
  year: number;
  focusedId: string | null;
  reducedMotion: boolean;
  onFocus: (id: string) => void;
  onHall: (index: number) => void;
}) {
  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  return (
    <>
      {halls.map((hall, index) => {
        const z0 = hallOrigin(index, halls);
        const length = 8 + hall.exhibitIds.length * hall.spacing;
        const width = 6 * hall.width;
        const light = hall.light;
        const members = hall.exhibitIds.map((id) => byId.get(id)).filter(Boolean) as MuseumNode[];
        if (hall.id === "era_0_precursors") {
          return (
            <PrecursorsRoom
              key={hall.id}
              hall={hall}
              originZ={z0}
              hallIndex={index}
              members={members}
              year={year}
              focusedId={focusedId}
              nextLabel={halls[index + 1]?.label}
              nextYear={halls[index + 1]?.startYear}
              nextSealed={
                halls[index + 1]?.id === "provisional"
                  ? year < 2023
                  : (halls[index + 1]?.exhibitIds ?? []).every((id) => (byId.get(id)?.startYear ?? 0) > year) &&
                    (halls[index + 1]?.exhibitIds.length ?? 0) > 0
              }
              onFocus={onFocus}
              onHall={onHall}
            />
          );
        }
        return (
          <group key={hall.id}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0, z0 - length / 2]}
              onClick={() => onHall(index)}
            >
              <planeGeometry args={[width, length]} />
              <meshStandardMaterial color={FLOOR} />
            </mesh>
            <mesh position={[width / 2, 1.4, z0 - length / 2]}>
              <boxGeometry args={[0.12, 2.8, length]} />
              <meshStandardMaterial color={hall.mood === "winter" ? "#2a241c" : "#3a342c"} />
            </mesh>
            <mesh position={[-width / 2, 1.4, z0 - length / 2]}>
              <boxGeometry args={[0.12, 2.8, length]} />
              <meshStandardMaterial color={hall.mood === "winter" ? "#2a241c" : "#3a342c"} />
            </mesh>
            <pointLight position={[0, 3, z0 - 2]} intensity={light} color={hall.mood === "winter" ? "#8899aa" : "#f2e6c9"} />
            <Text
              position={[0, 2.4, z0 - 0.8]}
              fontSize={0.32}
              color={BRASS}
              anchorX="center"
              anchorY="middle"
              maxWidth={5}
              textAlign="center"
            >
              {hall.label}
            </Text>
            {members.map((node, i) => (
              <Monument
                key={node.id}
                node={node}
                focused={node.id === focusedId}
                ghost={node.startYear > year}
                onFocus={onFocus}
                position={pedestalPosition(index, i, halls)}
              />
            ))}
            {hallThreads(hall.exhibitIds, members, year).map((thread) => {
              const fromIndex = hall.exhibitIds.indexOf(thread.fromId);
              const toIndex = hall.exhibitIds.indexOf(thread.toId);
              if (fromIndex < 0 || toIndex < 0) return null;
              return (
                <FloorThread
                  key={`${thread.fromId}-${thread.toId}`}
                  fromId={thread.fromId}
                  toId={thread.toId}
                  from={pedestalPosition(index, fromIndex, halls)}
                  to={pedestalPosition(index, toIndex, halls)}
                  focusedId={focusedId}
                  reducedMotion={reducedMotion}
                  onFocus={onFocus}
                />
              );
            })}
          </group>
        );
      })}
    </>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return true;
  return target.closest("input[type='range']") !== null;
}

export function HallCorridor({
  halls,
  nodes,
  year,
  hallIndex,
  focusedId,
  reducedMotion,
  onFocus,
  onHall,
}: {
  halls: Hall[];
  nodes: MuseumNode[];
  year: number;
  hallIndex: number;
  focusedId: string | null;
  reducedMotion: boolean;
  onFocus: (id: string) => void;
  onHall: (index: number) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      if (isTypingTarget(event.target)) return;
      if (event.key === "ArrowRight") onHall(hallIndex + 1);
      if (event.key === "ArrowLeft") onHall(hallIndex - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hallIndex, onHall]);

  return (
    <div ref={wrap} style={{ height: "100%", minHeight: "28rem" }}>
      <Canvas camera={{ position: [0, 1.6, 6], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <color attach="background" args={[FLOOR]} />
        <ambientLight intensity={0.25} />
        <CameraRig halls={halls} hallIndex={hallIndex} focusedId={focusedId} reducedMotion={reducedMotion} />
        <Corridor
          halls={halls}
          nodes={nodes}
          year={year}
          focusedId={focusedId}
          reducedMotion={reducedMotion}
          onFocus={onFocus}
          onHall={onHall}
        />
      </Canvas>
    </div>
  );
}
