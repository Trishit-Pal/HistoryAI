"use client";

import { DoubleSide } from "three";
import { eraLayout } from "../../src/museum/eraRooms";
import { HallTitle, Ink, NextMark, RoomExhibits } from "./roomKit";
import type { RoomProps } from "./roomProps";

export function DeepLearningRoom({
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
  const lit = spots.find((spot) => spot.id === focusedId) ?? spots[0];
  return (
    <group position={[0, 0, originZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} onClick={() => onHall(hallIndex)}>
        <circleGeometry args={[2.35, 40]} />
        <Ink tone="floor" />
      </mesh>
      <mesh position={[0, 1.2, -2]}>
        <cylinderGeometry args={[2.35, 2.35, 2.4, 28, 1, true, 0.7, Math.PI * 2 - 1.4]} />
        <Ink tone="wall" side={DoubleSide} />
      </mesh>
      <HallTitle position={[0, 2.15, -0.15]} label={hall.label} />
      <RoomExhibits members={members} spots={spots} year={year} focusedId={focusedId} onFocus={onFocus} />
      <NextMark z={-4.1} nextLabel={nextLabel} nextYear={nextYear} nextSealed={nextSealed} onNext={() => onHall(hallIndex + 1)} />
    </group>
  );
}
