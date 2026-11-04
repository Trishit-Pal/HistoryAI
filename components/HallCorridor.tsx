"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, Text } from "@react-three/drei";
import { LABEL_FONT } from "./labelFont";
import gsap from "gsap";
import type { Hall } from "../src/domain/layout";
import { hallThreads, otherThreadId } from "../src/domain/threads";
import { eraSpot } from "../src/museum/eraRooms";
import { focusedPedestal, hallLength, hallOrigin, pedestalPosition } from "../src/museum/hallMath";
import { precursorsCameraY } from "../src/museum/precursorsRoom";
import { isSealed } from "../src/museum/seal";
import { CHALK, CHALK_DIM, PRUSSIAN, REDLINE } from "../src/museum/theme";
import { cameraMove, type MuseumNode } from "../src/museum/view";
import { Ink } from "./Ink";
import { Monument } from "./Monument";
import { ERA_ROOMS } from "./rooms/eraRoomMap";

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
  const inPlacedRoom = Boolean(
    focusedId &&
      halls.some(
        (hall) =>
          hall.exhibitIds.includes(focusedId) &&
          (hall.id === "era_0_precursors" || eraSpot(hall.id, hall.exhibitIds, focusedId)),
      ),
  );
  const camZ = look[2] + (inPlacedRoom ? 4.2 : 6);
  const camY = precursorsCameraY(inPlacedRoom ? look[1] : null);
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
  onFocus,
}: {
  from: [number, number, number];
  to: [number, number, number];
  fromId: string;
  toId: string;
  focusedId: string | null;
  onFocus: (id: string) => void;
}) {
  const hot = focusedId === fromId || focusedId === toId;
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.hypot(dx, dz);
  if (length < 0.01) return null;
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, 0.03, (from[2] + to[2]) / 2];
  const angle = Math.atan2(dx, dz);
  return (
    <group position={mid} rotation={[0, angle, 0]}>
      <mesh>
        <boxGeometry args={[hot ? 0.05 : 0.025, 0.02, length]} />
        <meshBasicMaterial color={hot ? REDLINE : CHALK_DIM} />
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
  onFocus,
  onHall,
}: {
  halls: Hall[];
  nodes: MuseumNode[];
  year: number;
  focusedId: string | null;
  onFocus: (id: string) => void;
  onHall: (index: number) => void;
}) {
  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  return (
    <>
      {halls.map((hall, index) => {
        const z0 = hallOrigin(index, halls);
        const length = hallLength(hall);
        const width = 6 * hall.width;
        const members = hall.exhibitIds.map((id) => byId.get(id)).filter(Boolean) as MuseumNode[];
        const Room = ERA_ROOMS[hall.id];
        const next = halls[index + 1];
        const nextSealed = next ? isSealed(next, nodes, year) : false;
        if (Room) {
          return (
            <Room
              key={hall.id}
              hall={hall}
              originZ={z0}
              hallIndex={index}
              members={members}
              year={year}
              focusedId={focusedId}
              nextLabel={next?.label}
              nextYear={next?.startYear}
              nextSealed={nextSealed}
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
              <Ink tone="floor" />
            </mesh>
            <mesh position={[width / 2, 1.4, z0 - length / 2]}>
              <boxGeometry args={[0.12, 2.8, length]} />
              <Ink tone={hall.mood === "winter" ? "winter" : "wall"} />
            </mesh>
            <mesh position={[-width / 2, 1.4, z0 - length / 2]}>
              <boxGeometry args={[0.12, 2.8, length]} />
              <Ink tone={hall.mood === "winter" ? "winter" : "wall"} />
            </mesh>
            <Text
              font={LABEL_FONT}
              position={[0, 2.4, z0 - 0.8]}
              fontSize={0.32}
              color={CHALK}
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
  if (target.closest("input, textarea, select, [role='tab'], [contenteditable='true']")) return true;
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
    <div
      ref={wrap}
      className="corridor"
      role="img"
      aria-label="Plan of the halls. Move between exhibits with the exhibit tabs below, or between halls with the left and right arrow keys."
    >
      {/* flat: no tone mapping, so the Prussian fills match the Prussian ground exactly. */}
      <Canvas flat camera={{ position: [0, 1.6, 6], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <color attach="background" args={[PRUSSIAN]} />
        <Grid
          position={[0, -0.02, 0]}
          infiniteGrid
          followCamera
          cellSize={0.6}
          cellThickness={0.6}
          cellColor={CHALK_DIM}
          sectionSize={3}
          sectionThickness={1}
          sectionColor={CHALK_DIM}
          fadeDistance={34}
          fadeStrength={1.6}
        />
        <CameraRig
          halls={halls}
          hallIndex={hallIndex}
          focusedId={focusedId}
          reducedMotion={reducedMotion}
        />
        <Corridor
          halls={halls}
          nodes={nodes}
          year={year}
          focusedId={focusedId}
          onFocus={onFocus}
          onHall={onHall}
        />
      </Canvas>
    </div>
  );
}
