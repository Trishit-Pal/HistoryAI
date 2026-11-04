"use client";

import { Text } from "@react-three/drei";
import { loadsNear } from "../../src/museum/hallMath";
import type { Spot } from "../../src/museum/precursorsRoom";
import { CHALK } from "../../src/museum/theme";
import type { MuseumNode } from "../../src/museum/view";
import { FigurePlate } from "../FigurePlate";
import { Ink } from "../Ink";
import { LABEL_FONT } from "../labelFont";
import { Monument } from "../Monument";
import { hasArtefact, LABEL_ABOVE_ARTEFACT, PlinthArtefact } from "../artefacts/PlinthArtefact";

export { Ink };

export function RoomExhibits({
  members,
  spots,
  year,
  focusedId,
  onFocus,
}: {
  members: MuseumNode[];
  spots: Spot[];
  year: number;
  focusedId: string | null;
  onFocus: (id: string) => void;
}) {
  const byId = new Map(members.map((node) => [node.id, node]));
  // -1 when the focus is in another hall: then nothing here loads.
  const focusedIndex = spots.findIndex((spot) => spot.id === focusedId);
  return (
    <>
      {spots.map((spot, index) => {
        const node = byId.get(spot.id);
        if (!node) return null;
        const ghost = node.startYear > year;
        const load = loadsNear(index, focusedIndex);
        const position: [number, number, number] = [spot.x, spot.y, spot.z];
        return (
          <group key={node.id}>
            <Monument
              node={node}
              position={position}
              focused={node.id === focusedId}
              ghost={ghost}
              onFocus={onFocus}
              showLabel={node.id === focusedId}
              labelY={hasArtefact(node.id) ? LABEL_ABOVE_ARTEFACT : undefined}
            />
            <PlinthArtefact
              exhibitId={node.id}
              position={position}
              focused={node.id === focusedId}
              load={load}
              ghost={ghost}
              onFocus={onFocus}
            />
            <group position={[spot.x, spot.y + 0.55, spot.z + 0.5]}>
              <FigurePlate src={node.figure?.src} id={node.id} load={load} ghost={ghost} />
            </group>
          </group>
        );
      })}
    </>
  );
}

export function NextMark({
  z,
  y = 0,
  low = false,
  nextLabel,
  nextYear = null,
  nextSealed = false,
  onNext,
}: {
  z: number;
  y?: number;
  low?: boolean;
  nextLabel?: string;
  nextYear?: number | null;
  nextSealed?: boolean;
  onNext: () => void;
}) {
  const post = low ? 1.2 : 2.2;
  return (
    <group position={[0, y, z]}>
      <mesh position={[-0.7, post / 2, 0]}>
        <boxGeometry args={[0.08, post, 0.08]} />
        <Ink tone="metal" />
      </mesh>
      <mesh position={[0.7, post / 2, 0]}>
        <boxGeometry args={[0.08, post, 0.08]} />
        <Ink tone="metal" />
      </mesh>
      <mesh
        position={[0, post / 2, 0.16]}
        onClick={(event) => {
          event.stopPropagation();
          if (!nextSealed) onNext();
        }}
      >
        <boxGeometry args={[1.5, post, 0.3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {nextLabel ? (
        <Text font={LABEL_FONT} position={[0, post + 0.05, 0.08]} fontSize={0.12} color={CHALK} anchorX="center" maxWidth={2.2}>
          {nextSealed && nextYear ? `Opens ${nextYear}` : nextLabel}
        </Text>
      ) : null}
    </group>
  );
}

export function HallTitle({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <Text font={LABEL_FONT} position={position} fontSize={0.18} color={CHALK} anchorX="center" anchorY="middle" maxWidth={4.2}>
      {label}
    </Text>
  );
}
