"use client";

import { eraLayout } from "../../src/museum/eraRooms";
import { HallTitle, Ink, NextMark, RoomExhibits } from "./roomKit";
import type { RoomProps } from "./roomProps";

const COUNTER_MIN_WIDTH = 3.6;
// Room past the outermost plinths on each side, so the counter does not end at an exhibit's edge.
const COUNTER_OVERHANG = 1.6;

export function ExpertSystemsRoom({
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
  const counter = spots[0];
  // One counter under every exhibit: it grows from its single-exhibit width to span the whole row.
  const xs = spots.map((spot) => spot.x);
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  const counterWidth = Math.max(COUNTER_MIN_WIDTH, hi - lo + COUNTER_OVERHANG);
  const counterX = (lo + hi) / 2;
  return (
    <group position={[0, 0, originZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2.2]} onClick={() => onHall(hallIndex)}>
        <planeGeometry args={[5.6, 5.6]} />
        <Ink tone="floor" />
      </mesh>
      <mesh position={[2.8, 1.4, -2.2]}>
        <boxGeometry args={[0.1, 2.8, 5.6]} />
        <Ink tone="wall" />
      </mesh>
      <mesh position={[-2.8, 1.4, -2.2]}>
        <boxGeometry args={[0.1, 2.8, 5.6]} />
        <Ink tone="wall" />
      </mesh>
      <mesh position={[-1.75, 1.4, -5]}>
        <boxGeometry args={[2.1, 2.8, 0.1]} />
        <Ink tone="wall" />
      </mesh>
      <mesh position={[1.75, 1.4, -5]}>
        <boxGeometry args={[2.1, 2.8, 0.1]} />
        <Ink tone="wall" />
      </mesh>
      {counter ? (
        <mesh position={[counterX, counter.y / 2, counter.z]}>
          <boxGeometry args={[counterWidth, counter.y, 0.9]} />
          <Ink tone="stone" />
        </mesh>
      ) : null}
      <HallTitle position={[0, 2.3, -0.2]} label={hall.label} />
      <RoomExhibits members={members} spots={spots} year={year} focusedId={focusedId} onFocus={onFocus} />
      <NextMark z={-4.9} nextLabel={nextLabel} nextYear={nextYear} nextSealed={nextSealed} onNext={() => onHall(hallIndex + 1)} />
    </group>
  );
}
