"use client";

import { eraLayout } from "../../src/museum/eraRooms";
import { HallTitle, Ink, NextMark, RoomExhibits } from "./roomKit";
import type { RoomProps } from "./roomProps";

export function SymbolicRoom({
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
  const span = Math.abs(far) + 2.4;
  return (
    <group position={[0, 0, originZ]}>
      {spots.map((spot) => (
        <mesh key={spot.id} position={[0, spot.y - 0.04, spot.z]} onClick={() => onHall(hallIndex)}>
          <boxGeometry args={[6.6, 0.08, 2]} />
          <Ink tone="floor" />
        </mesh>
      ))}
      {spots.slice(1).map((spot) => (
        <mesh key={`${spot.id}-riser`} position={[0, spot.y + 0.05, spot.z + 1.05]}>
          <boxGeometry args={[6.6, 0.1, 0.08]} />
          <Ink tone="stone" />
        </mesh>
      ))}
      <mesh position={[3.3, 1.5, mid]}>
        <boxGeometry args={[0.1, 3.2, span]} />
        <Ink tone="wall" />
      </mesh>
      <mesh position={[-3.3, 1.5, mid]}>
        <boxGeometry args={[0.1, 3.2, span]} />
        <Ink tone="wall" />
      </mesh>
      <HallTitle position={[0, 2.15, -5]} label={hall.label} />
      <RoomExhibits members={members} spots={spots} year={year} focusedId={focusedId} onFocus={onFocus} />
      <NextMark z={far - 0.85} y={spots.at(-1)?.y ?? 0} nextLabel={nextLabel} nextYear={nextYear} nextSealed={nextSealed} onNext={() => onHall(hallIndex + 1)} />
    </group>
  );
}
