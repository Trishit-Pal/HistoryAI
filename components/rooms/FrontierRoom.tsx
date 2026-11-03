"use client";

import { eraLayout } from "../../src/museum/eraRooms";
import { HallTitle, Ink, NextMark, RoomExhibits } from "./roomKit";
import type { RoomProps } from "./roomProps";

export function FrontierRoom({
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
  const far = spots.at(-1)?.z ?? -2;
  const mid = far / 2;
  const span = Math.abs(far) + 1.6;
  return (
    <group position={[0, 0, originZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, mid]} onClick={() => onHall(hallIndex)}>
        <planeGeometry args={[6.2, span + 1.4]} />
        <Ink tone="floor" />
      </mesh>
      <mesh position={[3.1, 1.35, mid]}>
        <boxGeometry args={[0.1, 2.7, span]} />
        <Ink tone="wall" />
      </mesh>
      <mesh position={[-3.1, 1.35, mid]}>
        <boxGeometry args={[0.1, 2.7, span]} />
        <Ink tone="wall" />
      </mesh>
      {spots.map((spot) => (
        <mesh key={spot.id} position={[spot.x, 0.015, spot.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.62, 24]} />
          <Ink tone="metal" />
        </mesh>
      ))}
      <HallTitle position={[0, 2.3, -0.15]} label={hall.label} />
      <RoomExhibits members={members} spots={spots} year={year} focusedId={focusedId} onFocus={onFocus} />
      <NextMark z={far - 1.4} nextLabel={nextLabel} nextYear={nextYear} nextSealed={nextSealed} onNext={() => onHall(hallIndex + 1)} />
    </group>
  );
}
