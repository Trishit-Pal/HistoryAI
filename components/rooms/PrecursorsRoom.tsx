"use client";

import { Text } from "@react-three/drei";
import type { Hall } from "../../src/domain/layout";
import {
  ENTRANCE_PLAQUE_ID,
  TERRACE_RISE,
  TERRACE_STEP,
  precursorsLayout,
  stationLight,
} from "../../src/museum/precursorsRoom";
import type { MuseumNode } from "../../src/museum/view";
import { FigurePlate } from "../FigurePlate";
import { Monument } from "../Monument";

const FLOOR = "#1A1814";
const STONE = "#C8BBA4";
const BRASS = "#A6843D";
const WALL = "#3a342c";

export function PrecursorsRoom({
  hall,
  originZ,
  hallIndex,
  members,
  year,
  focusedId,
  nextLabel,
  nextSealed = false,
  nextYear = null,
  onFocus,
  onHall,
}: {
  hall: Hall;
  originZ: number;
  hallIndex: number;
  members: MuseumNode[];
  year: number;
  focusedId: string | null;
  nextLabel?: string;
  nextSealed?: boolean;
  nextYear?: number | null;
  onFocus: (id: string) => void;
  onHall: (index: number) => void;
}) {
  const spots = precursorsLayout(hall.exhibitIds);
  const stations = spots.filter((spot) => spot.id !== ENTRANCE_PLAQUE_ID);
  const focusedNode = members.find((node) => node.id === focusedId) ?? members[0];
  const byId = new Map(members.map((node) => [node.id, node]));
  const plaque = byId.get(ENTRANCE_PLAQUE_ID);
  const plaqueSpot = spots.find((spot) => spot.id === ENTRANCE_PLAQUE_ID);
  const focusedIndex = Math.max(0, stations.findIndex((spot) => spot.id === focusedId));
  const lastZ = stations.at(-1)?.z ?? 0;
  const spanStart = 2.7;
  const spanEnd = lastZ - 1.6;
  const span = spanStart - spanEnd;
  const midZ = (spanStart + spanEnd) / 2;
  const lit = spots.find((spot) => spot.id === focusedId) ?? plaqueSpot ?? stations[0];

  return (
    <group position={[0, 0, originZ]}>
      <pointLight
        position={[lit?.x ?? 0, (lit?.y ?? 0) + 2.2, lit?.z ?? 1.8]}
        intensity={4}
        distance={8}
        decay={2}
        color={stationLight(focusedNode?.startYear ?? 1843)}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 1.8]}
        onClick={() => onHall(hallIndex)}
      >
        <planeGeometry args={[6, 1.8]} />
        <meshStandardMaterial color={FLOOR} />
      </mesh>
      {stations.map((spot, index) => {
        const node = byId.get(spot.id);
        if (!node) return null;
        const position: [number, number, number] = [spot.x, spot.y, spot.z];
        const ghost = node.startYear > year;
        const load = Math.abs(index - focusedIndex) <= 1;
        return (
          <group key={node.id}>
            <mesh position={[0, spot.y - 0.04, spot.z]}>
              <boxGeometry args={[6, 0.08, TERRACE_STEP]} />
              <meshStandardMaterial color={FLOOR} />
            </mesh>
            {index > 0 ? (
              <mesh position={[0, spot.y - TERRACE_RISE / 2, spot.z + TERRACE_STEP / 2]}>
                <boxGeometry args={[6, TERRACE_RISE, 0.08]} />
                <meshStandardMaterial color={STONE} />
              </mesh>
            ) : null}
            {index === 1 ? (
              <Text
                position={[0, spot.y + 0.42, spot.z + TERRACE_STEP / 2 + 0.08]}
                fontSize={0.28}
                color={BRASS}
                anchorX="center"
                anchorY="middle"
              >
                {hall.label}
              </Text>
            ) : null}
            <Monument
              node={node}
              position={position}
              focused={node.id === focusedId}
              ghost={ghost}
              onFocus={onFocus}
              showLabel={node.id === focusedId}
            />
            <group position={[position[0], position[1] + 0.55, position[2] + 0.5]}>
              <FigurePlate src={node.figure?.src} id={node.id} load={load} ghost={ghost} />
            </group>
          </group>
        );
      })}
      {plaque && plaqueSpot ? (
        <group>
          <Monument
            node={plaque}
            position={[plaqueSpot.x, plaqueSpot.y, plaqueSpot.z]}
            focused={plaque.id === focusedId}
            ghost={plaque.startYear > year}
            onFocus={onFocus}
            showLabel={plaque.id === focusedId}
          />
          <group position={[plaqueSpot.x, plaqueSpot.y + 0.55, plaqueSpot.z + 0.5]}>
            <FigurePlate
              src={plaque.figure?.src}
              id={plaque.id}
              load={focusedId === plaque.id || focusedIndex === 0}
              ghost={plaque.startYear > year}
            />
          </group>
        </group>
      ) : null}
      {stations.at(-1) ? (
        <mesh
          position={[
            0,
            (stations.at(-1)?.y ?? 0) - 0.04,
            (((stations.at(-1)?.z ?? 0) - TERRACE_STEP / 2) + spanEnd) / 2,
          ]}
          onClick={() => {
            if (!nextSealed) onHall(hallIndex + 1);
          }}
        >
          <boxGeometry
            args={[
              6,
              0.08,
              Math.max(0.4, Math.abs(spanEnd - ((stations.at(-1)?.z ?? 0) - TERRACE_STEP / 2))),
            ]}
          />
          <meshStandardMaterial color={FLOOR} />
        </mesh>
      ) : null}
      <mesh position={[3, 1.5, midZ]}>
        <boxGeometry args={[0.12, 3.2, span]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[-3, 1.5, midZ]}>
        <boxGeometry args={[0.12, 3.2, span]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[-0.7, (stations.at(-1)?.y ?? 0) + 1.3, spanEnd]}>
        <boxGeometry args={[0.12, 2.6, 0.12]} />
        <meshStandardMaterial color={BRASS} />
      </mesh>
      <mesh position={[0.7, (stations.at(-1)?.y ?? 0) + 1.3, spanEnd]}>
        <boxGeometry args={[0.12, 2.6, 0.12]} />
        <meshStandardMaterial color={BRASS} />
      </mesh>
      <mesh position={[0, (stations.at(-1)?.y ?? 0) + 2.55, spanEnd]}>
        <boxGeometry args={[1.52, 0.1, 0.12]} />
        <meshStandardMaterial color={BRASS} />
      </mesh>
      {nextLabel ? (
        <Text
          position={[0, (stations.at(-1)?.y ?? 0) + 2.2, spanEnd + 0.08]}
          fontSize={0.12}
          color={BRASS}
          anchorX="center"
          maxWidth={2.4}
        >
          {nextSealed && nextYear ? `Opens ${nextYear}` : nextLabel}
        </Text>
      ) : null}
    </group>
  );
}
