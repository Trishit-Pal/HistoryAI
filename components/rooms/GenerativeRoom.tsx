"use client";

import { DoubleSide } from "three";
import { eraLayout } from "../../src/museum/eraRooms";
import { HallTitle, Ink, NextMark, RoomExhibits } from "./roomKit";
import type { RoomProps } from "./roomProps";

export function GenerativeRoom({
  hall,
  originZ,
  hallIndex,
  members,
  year,
  focusedId,
  nextLabel,
  nextYear,
  nextSealed,
  onFocus,
  onHall,
}: RoomProps) {
  const spots = eraLayout(hall.id, hall.exhibitIds) ?? [];
  return (
    <group position={[0, 0, originZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.9]} onClick={() => onHall(hallIndex)}>
        <circleGeometry args={[3.7, 48]} />
        <Ink tone="floor" />
      </mesh>
      <mesh position={[0, 1.35, -1.9]}>
        <cylinderGeometry args={[3.7, 3.7, 2.7, 40, 1, true, 0.5, Math.PI * 2 - 1]} />
        <Ink tone="wall" side={DoubleSide} />
      </mesh>
      {spots.map((spot) => (
        <mesh key={spot.id} position={[spot.x, spot.y / 2, spot.z]}>
          <cylinderGeometry args={[0.48, 0.66, spot.y, 6]} />
          <Ink tone="stone" />
        </mesh>
      ))}
      <HallTitle position={[0, 2.15, -3.8]} label={hall.label} />
      <RoomExhibits members={members} spots={spots} year={year} focusedId={focusedId} onFocus={onFocus} />
      <NextMark z={-4.8} nextLabel={nextLabel} nextYear={nextYear} nextSealed={nextSealed} onNext={() => onHall(hallIndex + 1)} />
    </group>
  );
}
