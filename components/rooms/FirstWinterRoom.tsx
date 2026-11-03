"use client";

import { eraLayout } from "../../src/museum/eraRooms";
import { firstWinterBoxes } from "../../src/museum/roomBoxes";
import { HallTitle, Ink, NextMark, RoomExhibits } from "./roomKit";
import type { RoomProps } from "./roomProps";

export function FirstWinterRoom({
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2.2]} onClick={() => onHall(hallIndex)}>
        <planeGeometry args={[6.6, 5.2]} />
        <Ink tone="floor" />
      </mesh>
      <mesh position={[0, 1.82, -2.2]}>
        <boxGeometry args={[6.6, 0.08, 5.2]} />
        <Ink tone="winter" />
      </mesh>
      {firstWinterBoxes().map((box) => (
        <mesh key={box.name} position={box.position}>
          <boxGeometry args={box.size} />
          <Ink tone="winter" />
        </mesh>
      ))}
      <HallTitle position={[0, 1.45, -0.35]} label={hall.label} />
      <RoomExhibits members={members} spots={spots} year={year} focusedId={focusedId} onFocus={onFocus} />
      <NextMark low z={-4.3} nextLabel={nextLabel} nextYear={nextYear} nextSealed={nextSealed} onNext={() => onHall(hallIndex + 1)} />
    </group>
  );
}
