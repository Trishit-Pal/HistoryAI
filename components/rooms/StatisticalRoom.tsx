"use client";

import { eraLayout } from "../../src/museum/eraRooms";
import { HallTitle, Ink, NextMark, RoomExhibits } from "./roomKit";
import type { RoomProps } from "./roomProps";

export function StatisticalRoom({
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} onClick={() => onHall(hallIndex)}>
        <planeGeometry args={[6.4, 4.8]} />
        <Ink tone="floor" />
      </mesh>
      <mesh position={[3.2, 1.4, -2]}>
        <boxGeometry args={[0.1, 2.8, 4.8]} />
        <Ink tone="wall" />
      </mesh>
      <mesh position={[-3.2, 1.4, -2]}>
        <boxGeometry args={[0.1, 2.8, 4.8]} />
        <Ink tone="wall" />
      </mesh>
      {spots.map((spot) => {
        const flat = spot.y < 0.2;
        return (
          <mesh key={spot.id} position={[spot.x, spot.y / 2, spot.z]}>
            <boxGeometry args={[flat ? 2.2 : 1.15, Math.max(spot.y, 0.08), flat ? 1.5 : 1.15]} />
            <Ink tone="stone" />
          </mesh>
        );
      })}
      <HallTitle position={[0, 2.3, -0.3]} label={hall.label} />
      <RoomExhibits members={members} spots={spots} year={year} focusedId={focusedId} onFocus={onFocus} />
      <NextMark z={-4} nextLabel={nextLabel} nextYear={nextYear} nextSealed={nextSealed} onNext={() => onHall(hallIndex + 1)} />
    </group>
  );
}
