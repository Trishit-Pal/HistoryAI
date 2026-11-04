"use client";

import { DoubleSide } from "three";
import { eraLayout } from "../../src/museum/eraRooms";
import { HallTitle, Ink, NextMark, RoomExhibits } from "./roomKit";
import type { RoomProps } from "./roomProps";

export function FoundingRoom({
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.6]} onClick={() => onHall(hallIndex)}>
        <circleGeometry args={[3.15, 48]} />
        <Ink tone="floor" />
      </mesh>
      <mesh position={[0, 1.35, -1.6]}>
        <cylinderGeometry args={[3.15, 3.15, 2.7, 40, 1, true, 0.55, Math.PI * 2 - 1.1]} />
        <Ink tone="wall" side={DoubleSide} />
      </mesh>
      {spots.map((spot) => (
        <mesh key={spot.id} position={[spot.x, spot.y / 2, spot.z]} rotation={[0, spot.x < 0 ? 0.4 : -0.4, 0]}>
          <boxGeometry args={[0.95, spot.y, 0.48]} />
          <Ink tone="stone" />
        </mesh>
      ))}
      <mesh position={[0, 0.04, -1.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.48, 24]} />
        <Ink tone="metal" />
      </mesh>
      <HallTitle position={[0, 2.7, -3.6]} label={hall.label} />
      <RoomExhibits members={members} spots={spots} year={year} focusedId={focusedId} onFocus={onFocus} />
      <NextMark z={-4.2} nextLabel={nextLabel} nextYear={nextYear} nextSealed={nextSealed} onNext={() => onHall(hallIndex + 1)} />
    </group>
  );
}
