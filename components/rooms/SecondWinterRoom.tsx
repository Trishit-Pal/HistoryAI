"use client";

import { eraLayout } from "../../src/museum/eraRooms";
import { HallTitle, Ink, NextMark, RoomExhibits } from "./roomKit";
import type { RoomProps } from "./roomProps";

export function SecondWinterRoom({
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.8]} onClick={() => onHall(hallIndex)}>
        <planeGeometry args={[2.5, 4.4]} />
        <Ink tone="floor" />
      </mesh>
      <mesh position={[0, 1.58, -1.8]}>
        <boxGeometry args={[2.5, 0.08, 4.4]} />
        <Ink tone="winter" />
      </mesh>
      <mesh position={[1.25, 0.78, -1.8]}>
        <boxGeometry args={[0.1, 1.56, 4.4]} />
        <Ink tone="winter" />
      </mesh>
      <mesh position={[-1.25, 0.78, -1.8]}>
        <boxGeometry args={[0.1, 1.56, 4.4]} />
        <Ink tone="winter" />
      </mesh>
      <HallTitle position={[0, 1.25, -0.2]} label={hall.label} />
      <RoomExhibits members={members} spots={spots} year={year} focusedId={focusedId} onFocus={onFocus} />
      <NextMark low z={-3.5} nextLabel={nextLabel} nextYear={nextYear} nextSealed={nextSealed} onNext={() => onHall(hallIndex + 1)} />
    </group>
  );
}
